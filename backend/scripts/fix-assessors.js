/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/scripts/fix-assessors.js
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * fix-assessors — WyshID module
 *
 * Responsibilities:
 * - Support wyshid functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const assessorsDir = path.join(__dirname, '../src/modules/ai-risk/services/assessors');

const files = fs.readdirSync(assessorsDir);

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(assessorsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Revert interface file if it got async keyword
  if (file === 'risk-assessor.interface.ts') {
    content = content.replace('async assess', 'assess');
    content = content.replace("from '../interfaces/ai-risk.interface'", "from '../../interfaces/ai-risk.interface'");
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Reverted interface in ${file}`);
    }
    return;
  }

  // Ensure import statement exists
  const importLine = "import { RiskAssessment } from '../../interfaces/ai-risk.interface';";
  if (!content.includes("from '../../interfaces/ai-risk.interface'") && !content.includes("from '../interfaces/ai-risk.interface'")) {
    content = importLine + "\n" + content;
  } else {
    // replace relative path if old
    content = content.replace(
      /from '\.\.\/interfaces\/ai-risk\.interface'/g,
      "from '../../interfaces/ai-risk.interface'"
    );
  }

  // Ensure 'async assess' exists
  content = content.replace(
    /\bassess\((data: AssessmentData)\):/g,
    'async assess(data: AssessmentData):'
  );

  // Fix readmission-risk assessor using 'age' instead of 'data.age'
  if (file === 'readmission-risk.assessor.ts') {
    content = content.replace(/\bage !== null && age >= 65/g, 'data.age !== null && data.age >= 65');
  }

  // Fix medication adherence risk assessor using 'freqs' index type safety
  if (file === 'medication-adherence-risk.assessor.ts') {
    content = content.replace(
      /const freqs = medicationFrequencies\[med\];/g,
      'const freqs = medicationFrequencies[med]!;'
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
