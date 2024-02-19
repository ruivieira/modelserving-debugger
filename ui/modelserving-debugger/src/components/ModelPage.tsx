import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Link } from 'react-router-dom';
import PayloadsNavbar from './PayloadsNavbar';
import PayloadDetails from './PayloadDetails';
import {
    Breadcrumb,
    BreadcrumbItem,
    Sidebar,
    SidebarPanel,
    SidebarContent,
    PageSection,
    Stack, StackItem, PageSidebar, PageSidebarBody, Page
} from '@patternfly/react-core';
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
                        payload: payload.Payload,
                        Timestamp: payload.Timestamp
                    }));
                    setPayloads(payloadsWithIds);

                    setModelName(modelId); // Optionally, set this to a more descriptive name if available
                } catch (error) {
                    console.error("Fetching payloads failed: ", error);
                }
            }
        };

        fetchPayloads();
    }, [modelId]);

    const sidebar = (
        <PageSidebar>
            <PageSidebarBody>
                <PayloadsNavbar modelId={modelId} payloads={payloads}/>
            </PageSidebarBody>
        </PageSidebar>
    );

    return (
        <Page sidebar={sidebar}>
            <PageSection>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/">Models</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive>{modelName}</BreadcrumbItem>
                </Breadcrumb>
            </PageSection>
            <PageSection>
                <Routes>
                    <Route path="/" element={<div>Select a payload</div>}/>
                    <Route path="payloads/:payloadId" element={<PayloadDetails/>}/>
                </Routes>
            </PageSection>
        </Page>
    );
};

export default ModelPage;
