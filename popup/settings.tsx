declare const chrome: any;

import {
    Box,
    FormControl,
    FormLabel,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    Tooltip,
    Wrap,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

const Settings = () => {
    const [datasourceEnabled, setDatasourceEnabled] = useState(true);

    useEffect(() => {
        // Load extension settings on component mount
        chrome.storage.sync.get('datasourceEnabled', (result: { datasourceEnabled?: boolean }) => {
            setDatasourceEnabled(result.datasourceEnabled ?? true);
        });
    }, []);

    const handleSwitchChange = () => {
        // Update extension settings when the switch is toggled
        const newDatasourceState = !datasourceEnabled;
        setDatasourceEnabled(newDatasourceState);
        chrome.storage.sync.set({ datasourceEnabled: newDatasourceState });
    };

    return (
        <Stack spacing='3'>
            <Text>
                Configure your XM Cloud extension settings here.
            </Text>

            {/* Feature Section */}
            <Box>
                <Text fontWeight='semibold'>
                    Feature Settings:
                </Text>
            </Box>

            {/* Datasource Viewer Setting */}
            <Box>
                <FormControl as={SimpleGrid} columns={{ base: 2, lg: 4 }}>
                    <FormLabel htmlFor='datasourceSwitch'>
                        <Tooltip
                            label="Displays direct Explorer/Content Editor link for data source items in the 'Assign Content Item' dialog">
                            Enable Datasource Viewer:
                        </Tooltip>
                    </FormLabel>
                    <Switch
                        id='datasourceSwitch'
                        isChecked={datasourceEnabled}
                        onChange={handleSwitchChange}
                    />
                </FormControl>
            </Box>

            {/* Additional settings or components can be added here */}
            <Wrap>
                {/* Additional settings or components can be added here */}
            </Wrap>
        </Stack>
    );
};

export default Settings;
