/**
 * Deterministic Query Verifier
 * Compares student query results with expected (golden) query results
 */

import { dbManager } from './db-manager.js';

export class Verifier {
    async verify(studentQuery, goldenQuery) {
        try {
            // Normalize queries - remove semicolons and extra whitespace
            const normalizeQuery = (query) => {
                return query
                    .trim()
                    .replace(/;+\s*$/, '') // Remove trailing semicolons
                    .replace(/\s+/g, ' '); // Normalize whitespace
            };

            const normalizedStudent = normalizeQuery(studentQuery);
            const normalizedGolden = normalizeQuery(goldenQuery);

            console.log('🔍 Verifying query...');
            console.log('📝 Student:', normalizedStudent);
            console.log('⭐ Golden:', normalizedGolden);

            // Execute both queries
            const goldenResult = await dbManager.executeQuery(normalizedGolden);
            const studentResult = await dbManager.executeQuery(normalizedStudent);

            console.log('📊 Golden result:', goldenResult.rows.length, 'rows');
            console.log('📊 Student result:', studentResult.rows.length, 'rows');

            // Compare results
            const comparison = this.compareResults(studentResult, goldenResult);
            
            console.log('✓ Comparison result:', comparison.isMatch);
            console.log('   Details:', {
                columnCountMatch: comparison.columnCountMatch,
                columnNamesMatch: comparison.columnNamesMatch,
                rowCountMatch: comparison.rowCountMatch,
                dataMatch: comparison.dataMatch
            });
            
            const result = {
                success: comparison.isMatch,
                studentResult,
                goldenResult,
                comparison
            };
            console.log('🎯 Verifier returning:', {
                success: result.success,
                studentResult: {
                    columns: result.studentResult?.columns?.length,
                    rows: result.studentResult?.rows?.length
                }
            });
            return result;
        } catch (error) {
            console.error('❌ Verification error:', error);
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

        // Check column names (case-insensitive, order-independent)
        const studentCols = [...studentResult.columns].map(c => c.toLowerCase()).sort();
        const goldenCols = [...goldenResult.columns].map(c => c.toLowerCase()).sort();
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
        if (comparison.columnCountMatch && comparison.rowCountMatch) {
            // When column names match OR only differ by case, compare data
            comparison.dataMatch = this.compareData(studentResult, goldenResult);
            // If column names don't match exactly but data matches, still mark columns as matching
            if (comparison.dataMatch && !comparison.columnNamesMatch) {
                comparison.columnNamesMatch = true;
            }
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

        if (studentResult.rows.length !== goldenResult.rows.length) {
            return false;
        }

        try {
            // Normalize and compare rows
            // Handle NULL values, numeric conversions, and case-insensitive keys
            const normalizeRow = (row) => {
                const normalized = {};
                for (const key in row) {
                    let val = row[key];
                    const lowerKey = key.toLowerCase();
                    // Convert null/undefined to string
                    if (val === null || val === undefined) {
                        normalized[lowerKey] = 'NULL';
                    } else if (typeof val === 'number') {
                        // Round to 4 decimal places to avoid floating point issues
                        normalized[lowerKey] = parseFloat(val.toFixed(4)).toString();
                    } else if (typeof val === 'bigint') {
                        normalized[lowerKey] = val.toString();
                    } else {
                        normalized[lowerKey] = String(val).trim();
                    }
                }
                return normalized;
            };

            // Normalize all rows
            const normalizedStudent = studentResult.rows.map(normalizeRow);
            const normalizedGolden = goldenResult.rows.map(normalizeRow);

            // Sort for order-independent comparison
            const sortRows = (rows) => {
                return [...rows].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
            };

            const sortedStudent = sortRows(normalizedStudent);
            const sortedGolden = sortRows(normalizedGolden);

            // Compare
            return JSON.stringify(sortedStudent) === JSON.stringify(sortedGolden);
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
