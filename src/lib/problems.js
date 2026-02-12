/**
 * SQL Practice Problems Database
 * Using Bike Store real data from bikestore_mysql.sql
 */

export const problems = [
    // PROBLEMS 1-5: Basic SELECT with WHERE
    {
        id: 1,
        title: "Select All Brands",
        difficulty: "beginner",
        description: "เขียนคำสั่ง SQL เพื่อเลือกข้อมูลแบรนด์จักรยานทั้งหมดจากตาราง brands",
        table: "brands",
        tableReference: "brands",
        columns: [
            { name: "brand_id", type: "INTEGER" },
            { name: "brand_name", type: "VARCHAR(255)" }
        ],
        requirements: [
            "ใช้โครงสร้าง SELECT",
            "เลือกข้อมูลจากตาราง brands",
            "แสดงผลทั้งหมด"
        ],
        goldenQuery: "SELECT * FROM brands",
        starterCode: "-- ค้นหาแบรนด์จักรยาน\nSELECT ",
        hintRules: ['basic_select']
    },
    {
        id: 2,
        title: "Select All Categories",
        difficulty: "beginner",
        description: "เลือกข้อมูลหมวดหมู่จักรยานทั้งหมดจากตาราง categories",
        table: "categories",
        tableReference: "categories",
        columns: [
            { name: "category_id", type: "INTEGER" },
            { name: "category_name", type: "VARCHAR(255)" }
        ],
        requirements: [
            "ใช้โครงสร้าง SELECT",
            "เลือกข้อมูลจากตาราง categories",
            "แสดงผลทั้งหมด"
        ],
        goldenQuery: "SELECT * FROM categories",
        starterCode: "-- ค้นหาหมวดหมู่\nSELECT ",
        hintRules: ['basic_select']
    },
    {
        id: 3,
        title: "Find Customers by City",
        difficulty: "beginner",
        description: "ค้นหาลูกค้าทั้งหมดจากเมือง Buffalo จากตาราง customers",
        table: "customers",
        tableReference: "customers",
        columns: [
            { name: "customer_id", type: "INTEGER" },
            { name: "first_name", type: "VARCHAR(255)" },
            { name: "last_name", type: "VARCHAR(255)" },
            { name: "city", type: "VARCHAR(50)" }
        ],
        requirements: [
            "ใช้ WHERE clause",
            "ค้นหาลูกค้าจากเมือง Buffalo",
            "ดูเฉพาะชื่อและนามสกุล"
        ],
        goldenQuery: "SELECT first_name, last_name FROM customers WHERE city = 'Buffalo'",
        starterCode: "-- ค้นหาลูกค้า\nSELECT * FROM customers\n",
        hintRules: ['missing_where']
    },
    {
        id: 4,
        title: "Products Over 1000",
        difficulty: "beginner",
        description: "ค้นหาสินค้าที่มีราคามากกว่า 1000 จากตาราง products",
        table: "products",
        tableReference: "products",
        columns: [
            { name: "product_id", type: "INTEGER" },
            { name: "product_name", type: "VARCHAR(255)" },
            { name: "list_price", type: "DECIMAL" }
        ],
        requirements: [
            "ใช้ WHERE clause",
            "ค้นหาสินค้าที่ list_price > 1000",
            "แสดงชื่อสินค้าและราคา"
        ],
        goldenQuery: "SELECT product_name, list_price FROM products WHERE list_price > 1000",
        starterCode: "-- ค้นหาสินค้า\nSELECT ",
        hintRules: ['missing_where']
    },
    {
        id: 5,
        title: "Count All Customers",
        difficulty: "beginner",
        description: "นับจำนวนลูกค้าทั้งหมดจากตาราง customers",
        table: "customers",
        tableReference: "customers",
        columns: [
            { name: "customer_id", type: "INTEGER" },
            { name: "first_name", type: "VARCHAR(255)" }
        ],
        requirements: [
            "ใช้ฟังก์ชัน COUNT(*)",
            "นับจำนวนลูกค้า",
            "ให้ชื่อคอลัมน์ผลลัพธ์ว่า total_customers"
        ],
        goldenQuery: "SELECT COUNT(*) as total_customers FROM customers",
        starterCode: "-- นับลูกค้า\nSELECT ",
        hintRules: ['missing_aggregate']
    }
];

export default problems;
