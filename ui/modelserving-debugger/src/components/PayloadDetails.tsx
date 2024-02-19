// PayloadDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PayloadWithId } from './Payloads';

const PayloadDetails = () => {
    const [payload, setPayload] = useState<PayloadWithId | null>(null);
    const { payloadId } = useParams<{ payloadId: string }>();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const kind = searchParams.get('kind'); // 'request' or 'response'

    useEffect(() => {
        const fetchPayload = async () => {
            if (payloadId && kind) {
                try {
                    const response = await fetch(`/api/payload-json/${payloadId}?kind=${kind}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data: PayloadWithId = await response.json();
                    setPayload(data);
                } catch (error) {
                    console.error("Fetching payload failed: ", error);
                }
            }
        };

        fetchPayload();
    }, [payloadId, kind]);

    return (
        <div>
            {payload && <pre>{JSON.stringify(payload, null, 2)}</pre>}
        </div>
    );
};

export default PayloadDetails;
