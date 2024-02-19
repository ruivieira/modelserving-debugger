import React from 'react';
import { List, ListItem } from '@patternfly/react-core';

const ModelsList = () => {
    // Example static data
    const models = ['Model 1', 'Model 2', 'Model 3'];

    return (
        <List>
            {models.map((model, index) => (
                <ListItem key={index}>{model}</ListItem>
            ))}
        </List>
    );
};

export default ModelsList;
