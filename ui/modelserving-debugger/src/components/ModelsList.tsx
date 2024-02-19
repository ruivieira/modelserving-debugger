import React, {useEffect, useState} from 'react';
import {
    List,
    ListItem,
    Masthead, MastheadBrand, MastheadContent,
    MastheadMain, Nav, NavItem, NavList,
    Page,
    PageSection,
    PageSectionVariants, PageSidebar, PageSidebarBody,
    Title
} from '@patternfly/react-core';
import {Link, NavLink, Route, Routes} from "react-router-dom";
import ModelPage from "./ModelPage";
import logo from "../assets/logo.png";
import PayloadsNavbar from "./PayloadsNavbar";

interface Model {
    name: string;
}
const ModelsList = () => {
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
            <MastheadContent>
                <span>Models</span>
            </MastheadContent>
        </Masthead>
    );

    const sidebar = (
        <PageSidebar>
            <PageSidebarBody>
                <Nav>
                    <NavList>
                        {models.map((model) => (
                            <NavItem key={`${model.name}`}>
                                <NavLink to={`/models/${model.name}`}>{model.name}</NavLink>
                            </NavItem>
                        ))}
                    </NavList>
                </Nav>

            </PageSidebarBody>
        </PageSidebar>
    );
    return (
        <Page header={header} sidebar={sidebar}>
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
        </Page>
    );
};

export default ModelsList;
