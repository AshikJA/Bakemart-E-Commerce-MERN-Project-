class DeliveryService {
    static getDeliveryEstimate(pincode, weight) {
        const cleanPincode = String(pincode || '').replace(/\D/g, '');
        
        if (!cleanPincode || cleanPincode.length !== 6) {
            return {
                success: false,
                message: 'Please enter a valid 6-digit pincode'
            };
        }

        const today = new Date();
        let deliveryDays = [];
        let minDays = 2;
        let maxDays = 4;
        let courierName = 'Express Delivery';
        let deliveryInfo = 'Priority delivery to your location';

        if (weight > 5) {
            minDays = 4;
            maxDays = 7;
            courierName = 'Standard Delivery';
            deliveryInfo = 'Standard delivery to your location';
        }

        for (let i = minDays; i <= maxDays; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0) {
                deliveryDays.push(date);
            }
        }

        if (deliveryDays.length === 0) {
            const date = new Date(today);
            date.setDate(date.getDate() + maxDays + 1);
            deliveryDays.push(date);
        }

        const formatDate = (date) => {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-IN', options);
        };

        const formatFullDate = (date) => {
            const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-IN', options);
        };

        const minDate = deliveryDays[0];
        const maxDate = deliveryDays[deliveryDays.length - 1];

        return {
            success: true,
            available: true,
            deliveryEstimate: {
                minDays,
                maxDays,
                minDate: formatDate(minDate),
                maxDate: formatDate(maxDate),
                minDateFull: formatFullDate(minDate),
                maxDateFull: formatFullDate(maxDate),
                dateRange: `${formatDate(minDate)} - ${formatDate(maxDate)}`,
                courierName,
                deliveryInfo,
                rate: 0,
                isCODAvailable: true
            }
        };
    }

    static checkServiceability(pincode) {
        const result = this.getDeliveryEstimate(pincode);
        
        if (!result.success) {
            return {
                success: false,
                available: false,
                message: result.message
            };
        }

        return {
            success: true,
            available: true,
            message: 'Delivery available to this pincode'
        };
    }
}

module.exports = DeliveryService;
