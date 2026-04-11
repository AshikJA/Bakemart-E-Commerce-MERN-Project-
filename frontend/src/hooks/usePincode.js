import { useCallback, useState } from "react";

const usePincode = () => {
    const [pincode, setPincode] = useState('');
    const [postOffices, setPostOffices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPincode = useCallback(async (pincode) => {
      if(!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
        setError('Invalid pincode');
        setPostOffices([]);
        return;
      }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            if (data[0].Status === 'Error' || !data[0].PostOffice) {
                setError('Invalid pincode, please check again');
                setPostOffices([]);
                return null;
            } else {
                setPostOffices(data[0].PostOffice);
                setError('');
                return data[0].PostOffice[0];
            }
        } catch (error) {
            setError("Could not fetch, enter manually");
            return null;
        } finally {
            setLoading(false);
        }
    },[]);

    return { pincode, setPincode, postOffices, loading, error, fetchPincode };
}

export default usePincode