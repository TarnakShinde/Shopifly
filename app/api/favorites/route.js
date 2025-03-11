// Example API route implementations - adapt these to your backend framework
// This assumes a Next.js API route structure

// File: /pages/api/favorites/add.js
import { db } from '../../../lib/db'; // Your database connection

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, productId, addedAt } = req.body;

    // Check if already in favorites to prevent duplicates
    const existing = await db.collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    if (!existing.empty) {
      return res.status(200).json({ success: true, message: 'Product already in favorites' });
    }

    // Add to favorites
    await db.collection('favorites').add({
      userId,
      productId,
      addedAt
    });

    return res.status(200).json({ success: true, message: 'Product added to favorites' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// File: /pages/api/favorites/remove.js
import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, productId } = req.body;

    // Find and delete the favorite
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    // Delete all matches (should only be one)
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });

    await Promise.all(deletePromises);

    return res.status(200).json({ success: true, message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// File: /pages/api/favorites/user/[userId].js
import { db } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    // Get all favorites for this user
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();

    const productIds = [];
    snapshot.forEach(doc => {
      productIds.push(doc.data().productId);
    });

    // Option 1: Return just the IDs
    // return res.status(200).json({ success: true, products: productIds });

    // Option 2: Fetch the full product details
    const productsSnapshot = await db.collection('products')
      .where('uniq_id', 'in', productIds)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// File: /pages/api/favorites/check.js
import { db } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, productId } = req.body;

    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    return res.status(200).json({
      success: true,
      isFavorite: !snapshot.empty
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
