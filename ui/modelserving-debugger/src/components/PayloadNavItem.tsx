import React from 'react';
import { NavLink } from 'react-router-dom';
import {NavItem, Text, TextListItem, TextList, TextVariants} from '@patternfly/react-core';
import { UploadIcon, DownloadIcon } from '@patternfly/react-icons';
import { Timestamp, TimestampTooltipVariant } from '@patternfly/react-core';
import { PayloadWithId } from './Payloads'; // Adjust the path as needed

const PayloadNavItem = ({ modelId, payload }: { modelId: string|undefined; payload: PayloadWithId }) => {
    return (
        <NavItem key={`${payload.id}-${payload.payload.kind}`}>
            <NavLink
                to={`/models/${modelId}/payloads/${payload.id}?kind=${payload.payload.kind}`}
            >
                <TextList>
                    <TextListItem>{payload.id}</TextListItem>
                    <TextListItem>
                        <Timestamp
                            date={new Date(payload.Timestamp)}
                            tooltip={{ variant: TimestampTooltipVariant.default, suffix: 'Coordinated Universal Time (UTC)' }}
                        />
                    </TextListItem>
                    <TextListItem>
                        <Text component={TextVariants.small}>
                        {payload.payload.kind === 'request' ? <UploadIcon /> : <DownloadIcon />}
                        [{payload.payload.kind}]
                        </Text>
                    </TextListItem>
                </TextList>
            </NavLink>
        </NavItem>
    );
};

export default PayloadNavItem;
