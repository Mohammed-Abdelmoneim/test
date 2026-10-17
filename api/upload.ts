import type { Request, Response } from 'express';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers['x-admin-auth'] || req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
  if (token && token !== 'cottonella2026' && token.length < 3) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required to upload files' });
  }

  try {
    const { image, name } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing image data' });
    }

    // On serverless environment, return the compressed image directly
    return res.status(200).json({
      success: true,
      url: image,
      dataUrl: image,
      name: name || 'uploaded-image',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
}
