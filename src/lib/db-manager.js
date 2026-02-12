/**
 * DuckDB-Wasm Database Manager
 * Handles database initialization and query execution with real bike store data
 */

import * as duckdb from '@duckdb/duckdb-wasm';

class DatabaseManager {
    constructor() {
        this.db = null;
        this.conn = null;
        this.isDataLoaded = false;
    }

    async initialize() {
        try {
            const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
            
            // Select bundle based on browser support
            const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
            
            const worker_url = URL.createObjectURL(
                new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
            );

            const worker = new Worker(worker_url);
            const logger = new duckdb.ConsoleLogger();
            this.db = new duckdb.AsyncDuckDB(logger, worker);
            await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
            URL.revokeObjectURL(worker_url);

            // Open a connection
            this.conn = await this.db.connect();
            
            // Load real database from SQL file
            await this.loadBikeStoreDatabase();
            
            console.log('✅ DuckDB initialized with Bike Store data');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize DuckDB:', error);
            throw error;
        }
    }

    async loadBikeStoreDatabase() {
        try {
            console.log('📦 Loading Bike Store database...');
            
            // Fetch the SQL file
            const response = await fetch('/bikestore_mysql.sql');
            if (!response.ok) {
                throw new Error(`Failed to fetch SQL file: ${response.status}`);
            }
            const sqlContent = await response.text();
            
            // Clean and parse SQL statements
            const statements = this.parseSQLStatements(sqlContent);
            
            console.log(`🔧 Executing ${statements.length} SQL statements...`);
            
            // Execute each statement
            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await this.conn.query(statement);
                    } catch (err) {
                        // Log but continue - some statements might fail due to syntax differences
                        console.warn(`⚠️ Statement failed (continuing):`, err.message.substring(0, 100));
                    }
                }
            }
            
            this.isDataLoaded = true;
            console.log('✅ Bike Store database loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load database:', error);
            throw error;
        }
    }

    parseSQLStatements(sqlContent) {
        // Remove comments and normalize
        let cleaned = sqlContent
            .replace(/--.*?$/gm, '') // Remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/`/g, '"') // Convert backticks to quotes for DuckDB
            .replace(/int\(11\)/gi, 'INTEGER') // Normalize int types
            .replace(/AUTO_INCREMENT/gi, 'SERIAL') // Convert AUTO_INCREMENT
            .replace(/ENGINE=[^ ]+/gi, '') // Remove engine specifications
            .replace(/CHARSET=[^ ]+/gi, '') // Remove charset specifications
            .replace(/COLLATE=[^ ]+/gi, '') // Remove collate specifications
            .replace(/DEFAULT.*?CHARSET/gi, 'DEFAULT') // Clean default definitions
            .replace(/utf8mb4_unicode_ci/gi, 'utf8') // Normalize collation
            .replace(/SET SQL_MODE[^;]+;/gi, '') // Remove SET statements
            .replace(/SET time_zone[^;]+;/gi, '')
            .replace(/START TRANSACTION[^;];/gi, '')
            .replace(/^!/gm, '--'); // Comment out MySQL-specific directives
        
        // Split by semicolon and filter empty statements
        const statements = cleaned
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        return statements;
    }

    async executeQuery(sql) {
        if (!this.conn) {
            throw new Error('Database not initialized');
        }

        try {
            const result = await this.conn.query(sql);
            return this.formatResult(result);
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    formatResult(result) {
        // Convert DuckDB result to a simple array of objects
        const rows = [];
        const numRows = result.numRows;
        
        if (numRows === 0) {
            return { columns: [], rows: [] };
        }

        // Get column names
        const columns = result.schema.fields.map(field => field.name);
        
        // Convert to array of row objects
        for (let i = 0; i < numRows; i++) {
            const row = {};
            columns.forEach(col => {
                row[col] = result.getChildAt(result.schema.fields.findIndex(f => f.name === col))?.get(i);
            });
            rows.push(row);
        }

        return { columns, rows };
    }

    async setupProblem(setupSQL) {
        if (!this.conn) {
            throw new Error('Database not initialized');
        }

        try {
            // Execute setup SQL
            const statements = this.parseSQLStatements(setupSQL);
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.executeQuery(statement);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    }

    async close() {
        if (this.conn) {
            await this.conn.close();
        }
        if (this.db) {
            await this.db.terminate();
        }
    }
}

// Export singleton instance
export const dbManager = new DatabaseManager();
