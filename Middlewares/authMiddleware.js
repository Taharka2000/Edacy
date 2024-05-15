const jwt = require('jsonwebtoken');

module.exports.verifyTokenAndRole = (req, res, next) => {
  // Si c'est une requête OPTIONS, simplement passer au middleware suivant
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Extraction du token de l'en-tête 'Authorization'
  const token = req.headers.authorization;
  console.log('Token reçu côté serveur :', token);

  // Vérification si le token est manquant
  if (!token || !token.startsWith('Bearer ')) {
    console.error('Format de token invalide ou token manquant');
    return res.status(401).json({ message: 'Format de token invalide' });
  }

  try {
    // Vérification du token en utilisant une clé secrète
    const decodedToken = jwt.verify(token.split(" ")[1], 'sammba yero taharka sow');

    // Vérification si les données utilisateur sont présentes
    if (!decodedToken || !decodedToken.data) {
      return res.status(401).json({ message: 'Token invalide. Données utilisateur manquantes.' });
    }

    // Attachement des données utilisateur à l'objet de requête
    req.user = decodedToken.data;

    // Vérification si l'utilisateur a le rôle 'tiak-tiak'
    if (req.user.role !== 'medecin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé sur cette requête' });
    }

    // Continuer vers le prochain middleware ou gestionnaire de route si tout est valide
    next();
  } catch (error) {
    // Journalisation des erreurs de vérification JWT
    console.error('Erreur de vérification JWT :', error);

    // Retourner un statut 401 si le token est invalide
    return res.status(401).json({ message: 'Token invalide' });
  }
};
