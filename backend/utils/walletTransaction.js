const mongoose = require('mongoose');

// Exécute `fn(session)` dans une transaction MongoDB multi-documents — équivalent
// du style callback de sequelize.transaction(async (t) => {...}) : si `fn` lève
// une erreur, la transaction est annulée automatiquement.
async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = { runInTransaction };
