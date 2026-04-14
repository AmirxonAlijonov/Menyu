// Vercel API endpoint for orders
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', success: false });
    }
    
    try {
        const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;
        
        if (!product || !quantity) {
            return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
        }
        
        // Prepare location text
        let locationText = '';
        if (tabchaNumber) {
            locationText = `Tabchan raqami: ${tabchaNumber}`;
        } else if (kabinaNumber) {
            locationText = `Kabina raqami: ${kabinaNumber}`;
        } else if (tableNumber) {
            locationText = `Stol raqami: ${tableNumber}`;
        }
        
        const orderText = `📦 YANGI BUYURTMA

📦 Mahsulot: ${product}
📊 Miqdor: ${quantity}
💰 Narx: ${price}
${locationText ? locationText + '\n' : ''}
⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
        
        console.log('Buyurtma qabul qilindi:', orderText);
        
        // For now, just acknowledge the order
        // TODO: Add Telegram bot integration here
        
        res.json({ success: true, message: 'Buyurtma qabul qilindi!' });
        
    } catch (error) {
        console.error('Xato:', error);
        res.status(500).json({ success: false, error: 'Server xatosi' });
    }
};