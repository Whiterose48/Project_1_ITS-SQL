/**
 * Deterministic Query Verifier
 * Compares student query results with expected (golden) query results
 */

import { dbManager } from './db-manager.js';

export class Verifier {
    async verify(studentQuery, goldenQuery) {
        try {
            // Execute both queries
            const goldenResult = await dbManager.executeQuery(goldenQuery);
            const studentResult = await dbManager.executeQuery(studentQuery);

            // Compare results
            const comparison = this.compareResults(studentResult, goldenResult);
            
            return {
                success: comparison.isMatch,
                studentResult,
                goldenResult,
                comparison
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                studentResult: null,
                goldenResult: null,
                comparison: null
            };
        }
    }

    compareResults(studentResult, goldenResult) {
        const comparison = {
            isMatch: false,
            columnCountMatch: false,
            columnNamesMatch: false,
            rowCountMatch: false,
            dataMatch: false,
            details: {}
        };

        // Check column count
        comparison.columnCountMatch = 
            studentResult.columns.length === goldenResult.columns.length;
        comparison.details.studentColumnCount = studentResult.columns.length;
        comparison.details.goldenColumnCount = goldenResult.columns.length;

        // Check column names (order-independent for some cases)
        const studentCols = [...studentResult.columns].sort();
        const goldenCols = [...goldenResult.columns].sort();
        comparison.columnNamesMatch = 
            JSON.stringify(studentCols) === JSON.stringify(goldenCols);
        comparison.details.studentColumns = studentResult.columns;
        comparison.details.goldenColumns = goldenResult.columns;

        // Check row count
        comparison.rowCountMatch = 
            studentResult.rows.length === goldenResult.rows.length;
        comparison.details.studentRowCount = studentResult.rows.length;
        comparison.details.goldenRowCount = goldenResult.rows.length;

        // If basic structure matches, compare data
        if (comparison.columnCountMatch && comparison.columnNamesMatch && comparison.rowCountMatch) {
            comparison.dataMatch = this.compareData(studentResult, goldenResult);
        }

        // Overall match
        comparison.isMatch = 
            comparison.columnCountMatch && 
            comparison.columnNamesMatch && 
            comparison.rowCountMatch && 
            comparison.dataMatch;

        return comparison;
    }

    compareData(studentResult, goldenResult) {
        if (studentResult.rows.length === 0 && goldenResult.rows.length === 0) {
            return true;
        }

        // For simplicity, we'll do order-dependent comparison first
        // In a more advanced version, we could do order-independent comparison for certain queries
        
        try {
            // Convert both to sorted JSON strings for comparison
            const studentStr = JSON.stringify(this.sortRows(studentResult.rows, studentResult.columns));
            const goldenStr = JSON.stringify(this.sortRows(goldenResult.rows, goldenResult.columns));
            
            return studentStr === goldenStr;
        } catch (error) {
            console.error('Data comparison error:', error);
            return false;
        }
    }

    sortRows(rows, columns) {
        // Sort rows by all columns to make comparison order-independent
        return [...rows].sort((a, b) => {
            for (const col of columns) {
                const aVal = String(a[col] ?? '');
                const bVal = String(b[col] ?? '');
                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
            }
            return 0;
        });
    }

    // Extract metadata useful for hint generation
    extractMetadata(studentQuery, comparison) {
        const metadata = {
            hasWhere: /WHERE/i.test(studentQuery),
            hasOrderBy: /ORDER BY/i.test(studentQuery),
            hasGroupBy: /GROUP BY/i.test(studentQuery),
            hasHaving: /HAVING/i.test(studentQuery),
            hasLimit: /LIMIT/i.test(studentQuery),
            hasAggregates: /COUNT|SUM|AVG|MAX|MIN/i.test(studentQuery),
            selectsAllColumns: /SELECT\s+\*/i.test(studentQuery),
            ...comparison.details
        };

        return metadata;
    }
}

export const verifier = new Verifier();
