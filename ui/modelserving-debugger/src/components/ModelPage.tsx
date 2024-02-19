import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link } from 'react-router-dom';
import PayloadsNavbar from './PayloadsNavbar';
import PayloadDetails from './PayloadDetails';
import { PageSection, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { PayloadHistory, PayloadWithId } from './Payloads';

const ModelPage = () => {
    const [payloads, setPayloads] = useState<PayloadWithId[]>([]);
    const { modelId } = useParams<{ modelId: string }>();
    const [modelName, setModelName] = useState('');

    useEffect(() => {
        const fetchPayloads = async () => {
            if (modelId) {
                try {
                    const response = await fetch(`/api/models/${modelId}/payloads`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data: PayloadHistory[] = await response.json();
                    const payloadsWithIds = data.map(payload => ({
                        id: payload.Payload.id,
                        name: `Payload at ${new Date(payload.Timestamp).toLocaleString()}`,
                        kind: payload.Payload.kind,
                    }));
                    setPayloads(payloadsWithIds);

                    setModelName(modelId);
                } catch (error) {
                    console.error("Fetching payloads failed: ", error);
                }
            }
        };

        fetchPayloads();
    }, [modelId]);

    return (
        <div>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to="/">Models</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{modelName}</BreadcrumbItem>
            </Breadcrumb>
            <div style={{display: 'flex', height: 'calc(100vh - 4rem)', marginTop: '2rem'}}>
                <aside style={{flexBasis: '20%', overflowY: 'auto', height: '100%'}}>
                    <PayloadsNavbar modelId={modelId} payloads={payloads}/>
                </aside>
                <main style={{flexGrow: '1', overflowY: 'hidden'}}>
                    <PageSection>
                        <Routes>
                            <Route path="/" element={<div>Select a payload</div>}/>
                            <Route path="payloads/:payloadId" element={<PayloadDetails/>}/>
                        </Routes>
                    </PageSection>
                </main>
            </div>
        </div>
    );
};

export default ModelPage;
