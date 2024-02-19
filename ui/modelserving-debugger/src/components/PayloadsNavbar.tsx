import React from 'react';
import { Nav, NavList } from '@patternfly/react-core';
import {PayloadWithId} from './Payloads';
import PayloadNavItem from './PayloadNavItem'

const PayloadsNavbar = ({ modelId, payloads }: { modelId: string|undefined; payloads: PayloadWithId[] }) => {
    return (
        <Nav>
            <NavList>
                {payloads.map((payload) => (
                    <PayloadNavItem key={`${payload.id}-${payload.payload.kind}`} modelId={modelId} payload={payload} />
                ))}
            </NavList>
        </Nav>
    );
};

export default PayloadsNavbar;
