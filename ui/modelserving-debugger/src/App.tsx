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
    ListItem, MastheadContent
} from '@patternfly/react-core';
import '@patternfly/react-core/dist/styles/base.css';

import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';
import ModelPage from './components/ModelPage';

import logo from './assets/logo.png';
import ModelsList from "./components/ModelsList";



const MyPage = () => {

    return (
        <Router>
                <Routes>
                    <Route path="/" element={<ModelsList/>} />
                    <Route path="/models/:modelId/*" element={<ModelPage />} />
                </Routes>
        </Router>
    );
};

export default MyPage;
