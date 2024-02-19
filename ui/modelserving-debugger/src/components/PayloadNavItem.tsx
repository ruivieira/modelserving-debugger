import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavItem, Text, TextListItem, TextList } from '@patternfly/react-core';
import { UploadIcon, DownloadIcon } from '@patternfly/react-icons';
import { Timestamp, TimestampTooltipVariant } from '@patternfly/react-core';
import { PayloadWithId } from './Payloads'; // Adjust the path as needed

const PayloadNavItem = ({ modelId, payload }: { modelId: string|undefined; payload: PayloadWithId }) => {
    return (
        <NavItem key={`${payload.id}-${payload.payload.kind}`}>
            <NavLink
                to={`/models/${modelId}/payloads/${payload.id}?kind=${payload.payload.kind}`}
            >
                <TextList component="dl">
                    <TextListItem component="dt">ID:</TextListItem>
                    <TextListItem component="dd">{payload.id}</TextListItem>
                    <TextListItem component="dt">Timestamp:</TextListItem>
                    <TextListItem component="dd">
                        <Timestamp
                            date={new Date(payload.Timestamp)}
                            tooltip={{ variant: TimestampTooltipVariant.default, suffix: 'Coordinated Universal Time (UTC)' }}
                        />
                    </TextListItem>
                    <TextListItem component="dt">Kind:</TextListItem>
                    <TextListItem component="dd">
                        {payload.payload.kind === 'request' ? <UploadIcon /> : <DownloadIcon />}
                        [{payload.payload.kind}]
                    </TextListItem>
                </TextList>
            </NavLink>
        </NavItem>
    );
};

export default PayloadNavItem;
