import React, { useState, useEffect } from 'react';
import {
    Page,
    Masthead,
    MastheadMain,
    MastheadBrand,
    PageSection,
    PageSectionVariants,
    Title,
    List,
    ListItem
} from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';

import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';
import ModelPage from './components/ModelPage';

import logo from './assets/logo.png';

interface Model {
    name: string;
}

const MyPage = () => {
    const [models, setModels] = useState<Model[]>([]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('/api/models');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setModels(data);
            } catch (error) {
                console.error("Fetching models failed: ", error);
            }
        };

        fetchModels();
    }, []);

    const header = (
        <Masthead>
            <MastheadMain>
                <MastheadBrand><img src={logo} alt="Logo" style={{ height: '50px' }}/></MastheadBrand>
            </MastheadMain>
        </Masthead>
    );

    return (
        <Router>
            <Page header={header}>
                <Routes>
                    <Route path="/" element={
                        <PageSection variant={PageSectionVariants.light}>
                            <Title headingLevel="h1" size="lg">Available Models</Title>
                            <List>
                                {models.map((model, index) => (
                                    <ListItem key={index}>
                                        <Link to={`/models/${model.name}`}>{model.name}</Link>
                                    </ListItem>
                                ))}
                            </List>
                        </PageSection>
                    } />
                    <Route path="/models/:modelId/*" element={<ModelPage />} />
                </Routes>
            </Page>
        </Router>
    );
};

export default MyPage;
