/**
 * Rule-Based Hint Engine
 * Generates hints based on common SQL mistakes and query analysis
 */

export class HintEngine {
    constructor() {
        this.hints = [];
        this.currentHintIndex = 0;
    }

    generateHints(studentQuery, verificationResult, problem) {
        this.hints = [];
        this.currentHintIndex = 0;

        // If there's a syntax error, provide that first
        if (verificationResult.error) {
            this.addSyntaxErrorHints(verificationResult.error);
            return this.hints;
        }

        const comparison = verificationResult.comparison;
        const metadata = {
            hasWhere: /WHERE/i.test(studentQuery),
            hasOrderBy: /ORDER BY/i.test(studentQuery),
            hasGroupBy: /GROUP BY/i.test(studentQuery),
            hasHaving: /HAVING/i.test(studentQuery),
            hasLimit: /LIMIT/i.test(studentQuery),
            hasAggregates: /COUNT|SUM|AVG|MAX|MIN/i.test(studentQuery),
            selectsAllColumns: /SELECT\s+\*/i.test(studentQuery)
        };

        // Apply rule-based hints based on problem's hint rules
        if (problem.hintRules) {
            problem.hintRules.forEach(rule => {
                this.applyRule(rule, studentQuery, comparison, metadata, problem);
            });
        }

        // Generic hints based on comparison results
        this.applyGenericHints(comparison, metadata);

        return this.hints;
    }

    applyRule(rule, studentQuery, comparison, metadata, problem) {
        switch (rule) {
            case 'basic_select':
                if (!studentQuery.trim().toUpperCase().includes('SELECT')) {
                    this.addHint('tip', 'Start with SELECT to retrieve data from a table.');
                }
                break;

            case 'missing_where':
                if (!metadata.hasWhere && comparison.details.studentRowCount > comparison.details.goldenRowCount) {
                    this.addHint('warning', 
                        "You're selecting all rows. Do you need all rows, or just specific ones?",
                        "Use WHERE to filter results:\nSELECT * FROM table WHERE condition");
                }
                break;

            case 'missing_group_by':
                if (metadata.hasAggregates && !metadata.hasGroupBy) {
                    // Check if golden query has GROUP BY
                    if (/GROUP BY/i.test(problem.goldenQuery)) {
                        this.addHint('warning',
                            "When using aggregate functions like COUNT, SUM, you might need GROUP BY to group results.",
                            "SELECT column, COUNT(*) FROM table GROUP BY column");
                    }
                }
                break;

            case 'missing_order_by':
                if (!metadata.hasOrderBy && /ORDER BY/i.test(problem.goldenQuery)) {
                    this.addHint('warning',
                        "Your results might not be in the right order. Consider using ORDER BY.",
                        "SELECT * FROM table ORDER BY column ASC");
                }
                break;

            case 'missing_limit':
                if (!metadata.hasLimit && /LIMIT/i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "You might need to limit the number of results returned.",
                        "SELECT * FROM table LIMIT 3");
                }
                break;

            case 'missing_having':
                if (!metadata.hasHaving && /HAVING/i.test(problem.goldenQuery)) {
                    this.addHint('warning',
                        "To filter grouped results, use HAVING instead of WHERE.",
                        "SELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 1");
                }
                break;

            case 'string_quotes':
                if (studentQuery.includes('"') || !/'[^']*'/.test(studentQuery)) {
                    this.addHint('tip',
                        "In SQL, string values should be enclosed in single quotes ' '.",
                        "WHERE city = 'New York'");
                }
                break;

            case 'column_selection':
                if (metadata.selectsAllColumns && !comparison.columnCountMatch) {
                    this.addHint('warning',
                        "SELECT * returns all columns. Try selecting only specific columns.",
                        "SELECT column1, column2 FROM table");
                }
                break;

            case 'multiple_conditions':
                if (metadata.hasWhere && comparison.details.studentRowCount !== comparison.details.goldenRowCount) {
                    this.addHint('tip',
                        "You can combine multiple conditions using AND or OR.",
                        "WHERE condition1 AND condition2");
                }
                break;

            case 'or_condition':
                if (!/ OR /i.test(studentQuery) && / OR /i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "Use OR when you want rows that match ANY of the conditions.",
                        "WHERE category = 'Electronics' OR price < 100");
                }
                break;

            case 'count_function':
                if (!metadata.hasAggregates && /COUNT/i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "Use COUNT(*) to count the number of rows.",
                        "SELECT COUNT(*) FROM table");
                }
                break;

            case 'sum_function':
                if (!metadata.hasAggregates && /SUM/i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "Use SUM(column) to calculate the total of a numeric column.",
                        "SELECT SUM(amount) FROM table");
                }
                break;

            case 'avg_function':
                if (!metadata.hasAggregates && /AVG/i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "Use AVG(column) to calculate the average of a numeric column.",
                        "SELECT AVG(price) FROM table");
                }
                break;

            case 'max_function':
                if (!metadata.hasAggregates && /MAX/i.test(problem.goldenQuery)) {
                    this.addHint('tip',
                        "Use MAX(column) to find the highest value in a column.",
                        "SELECT MAX(price) FROM table");
                }
                break;
        }
    }

    applyGenericHints(comparison, metadata) {
        const d = comparison.details || {};

        // Wrong number of columns — most fundamental, stop here.
        if (!comparison.columnCountMatch) {
            this.addHint('error',
                `Your query returns ${d.studentColumnCount} column(s), but ${d.goldenColumnCount} column(s) are expected.`,
                "Select exactly the columns the problem asks for.");
            return;
        }

        // Right rows, wrong order (ORDER BY problems).
        if (d.orderIssue) {
            this.addHint('warning',
                "Your rows are correct, but not in the expected order. Add or adjust ORDER BY.",
                "SELECT ... ORDER BY column ASC|DESC");
            return;
        }

        // Wrong number of rows.
        if (!comparison.rowCountMatch) {
            this.addHint('warning',
                `Your query returns ${d.studentRowCount} row(s), but ${d.goldenRowCount} row(s) are expected. Check your filtering (WHERE), joins, or DISTINCT.`);
            return;
        }

        // Same shape, but some values differ.
        if (!comparison.dataMatch) {
            this.addHint('warning',
                "Row and column counts match, but some values differ. Check your calculations, conditions, or which columns you selected.");
        }
    }

    addSyntaxErrorHints(errorMessage) {
        // Parse common DuckDB error messages and provide friendly hints
        const lowerError = errorMessage.toLowerCase();

        if (lowerError.includes('syntax error')) {
            this.addHint('error', 
                "There's a syntax error in your query. Check for missing commas, quotes, or keywords.",
                "Common mistakes:\n- Missing comma between columns\n- Unclosed quotes\n- Misspelled keywords");
        } else if (lowerError.includes('table') && lowerError.includes('not found')) {
            this.addHint('error',
                "Table not found. Make sure you're using the correct table name.");
        } else if (lowerError.includes('column') && lowerError.includes('not found')) {
            this.addHint('error',
                "Column not found. Check the column name spelling and case.");
        } else {
            this.addHint('error', `SQL Error: ${errorMessage}`);
        }
    }

    addHint(severity, message, codeSample = null) {
        this.hints.push({
            severity, // 'error', 'warning', 'tip'
            message,
            codeSample
        });
    }

    getNextHint() {
        if (this.currentHintIndex < this.hints.length) {
            return this.hints[this.currentHintIndex++];
        }
        return null;
    }

    getCurrentHints() {
        return this.hints.slice(0, this.currentHintIndex);
    }

    getAllHints() {
        return this.hints;
    }

    reset() {
        this.hints = [];
        this.currentHintIndex = 0;
    }
}

export const hintEngine = new HintEngine();
