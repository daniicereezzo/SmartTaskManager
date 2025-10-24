const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
require('dotenv').config();

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements, handling function definitions and dollar-quoted strings
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let inDollarQuote = false;
    let dollarTag = '';
    
    const lines = schema.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check for dollar-quoted strings
      if (trimmedLine.includes('$$')) {
        if (!inDollarQuote) {
          // Starting a dollar-quoted string
          const dollarMatch = trimmedLine.match(/\$([^$]*)\$/);
          if (dollarMatch) {
            dollarTag = dollarMatch[0];
            inDollarQuote = true;
          }
        } else if (trimmedLine.includes(dollarTag)) {
          // Ending a dollar-quoted string
          inDollarQuote = false;
          dollarTag = '';
        }
      }
      
      // Check if we're entering a function definition
      if (!inDollarQuote && (trimmedLine.includes('CREATE OR REPLACE FUNCTION') || trimmedLine.includes('CREATE FUNCTION'))) {
        inFunction = true;
      }
      
      // If we're in a function and not in a dollar-quoted string, look for the end
      if (inFunction && !inDollarQuote && trimmedLine.endsWith(';')) {
        inFunction = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (!inFunction && !inDollarQuote && trimmedLine.endsWith(';')) {
        // Regular statement ending with semicolon
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await sequelize.query(statement);
        } catch (error) {
          // Some statements might fail if they already exist (like CREATE EXTENSION)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists or not applicable)`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🎉 Migration process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = migrate;
