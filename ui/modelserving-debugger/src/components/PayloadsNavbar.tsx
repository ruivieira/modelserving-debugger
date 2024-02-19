import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, NavList, NavItem } from '@patternfly/react-core';
import {PayloadWithId} from './Payloads';

const PayloadsNavbar = ({ modelId, payloads }: { modelId: string|undefined; payloads: PayloadWithId[] }) => {
    return (
        <Nav theme="light">
            <NavList>
                {payloads.map((payload) => (
                    <NavItem key={`${payload.id}-${payload.kind}`}>
                        <NavLink
                            to={`/models/${modelId}/payloads/${payload.id}?kind=${payload.kind}`}
                            className={({ isActive }) => isActive ? 'pf-m-current' : ''}
                        >
                            {payload.name} ({payload.kind})
                        </NavLink>
                    </NavItem>
                ))}
            </NavList>
        </Nav>
    );
};

export default PayloadsNavbar;
