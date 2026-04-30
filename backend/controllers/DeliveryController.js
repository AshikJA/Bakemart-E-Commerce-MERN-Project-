const DeliveryService = require('../services/DeliveryService');

class DeliveryController {
    static async checkDelivery(req, res) {
        try {
            let { pincode, weight } = req.body;

            pincode = String(pincode || '').trim();

            if (!pincode) {
                return res.status(400).json({ message: 'Pincode is required' });
            }

            const cleanPincode = pincode.replace(/\D/g, '');

            if (cleanPincode.length !== 6) {
                return res.status(400).json({ message: 'Please enter a valid 6-digit pincode' });
            }

            const result = DeliveryService.getDeliveryEstimate(cleanPincode, weight);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error('Check delivery error:', error);
            return res.status(500).json({ message: 'Failed to check delivery availability' });
        }
    }

    static async checkServiceability(req, res) {
        try {
            let { pincode } = req.body;

            pincode = String(pincode || '').trim();

            if (!pincode) {
                return res.status(400).json({ message: 'Pincode is required' });
            }

            const cleanPincode = pincode.replace(/\D/g, '');

            if (cleanPincode.length !== 6) {
                return res.status(400).json({ message: 'Please enter a valid 6-digit pincode' });
            }

            const result = DeliveryService.checkServiceability(cleanPincode);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Check serviceability error:', error);
            return res.status(500).json({ message: 'Failed to check serviceability' });
        }
    }

    static async getDefaultEstimate(req, res) {
        try {
            const defaultResult = DeliveryService.getDeliveryEstimate('574239');
            return res.status(200).json({
                success: true,
                deliveryEstimate: defaultResult.deliveryEstimate,
                message: 'Default estimate (Sullia, Karnataka)'
            });
        } catch (error) {
            console.error('Get default estimate error:', error);
            return res.status(500).json({ message: 'Failed to get default estimate' });
        }
    }
}

module.exports = DeliveryController;
