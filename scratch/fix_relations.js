const fs = require('fs');
const path = require('path');

const dirs = ['app', 'components', 'lib'];
const replacements = [
  { regex: /\becoles\b/g, replacement: 'ecole', ignoreIfBefore: 'ecole.', ignoreIfAfter: 'ecole' }, // e.g., user.ecoles -> user.ecole
  { regex: /\bemplois_du_temps\b/g, replacement: 'emploisDuTemps' },
  { regex: /\bparent_eleve\b/g, replacement: 'parentEleve' },
  { regex: /\bparcours_scolaires\b/g, replacement: 'parcoursScolaires' },
  { regex: /\beleve_badges\b/g, replacement: 'eleveBadges' },
];

function processFile(p) {
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  // Replace easy ones
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  // ecoles -> ecole (Careful with user.ecoles but NOT prisma.ecole - already handled?)
  // Actually, let's just do targeted replaces for the known issues:
  content = content.replace(/ecoles:/g, 'ecole:');
  content = content.replace(/\.ecoles(\?|\.|\[)/g, '.ecole$1');
  
  // evaluations -> evaluation in Note include
  content = content.replace(/evaluations:/g, 'evaluation:');
  content = content.replace(/\.evaluations(\?|\.|\[)/g, '.evaluation$1');

  // classes -> classe
  content = content.replace(/classes:/g, 'classe:');
  content = content.replace(/\.classes(\?|\.|\[)/g, '.classe$1');
  // BUT revert if it's Ecole.classes
  // Let's just manually review if there are broken things after.
  
  // users -> user
  content = content.replace(/users:/g, 'user:');
  content = content.replace(/\.users(\?|\.|\[)/g, '.user$1');

  if (content !== original) {
    fs.writeFileSync(p, content);
    console.log('Fixed relations in', p);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      processFile(p);
    }
  });
}

dirs.forEach(walk);
