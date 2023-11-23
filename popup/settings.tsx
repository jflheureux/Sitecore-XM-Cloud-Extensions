declare const chrome: any;

import {
    Box,
    Flex,
    FormControl,
    FormLabel,
    SimpleGrid,
    Spacer,
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
        // Load extension settings
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

            {/* Feature list */}
            <Box>
                <FormControl as={SimpleGrid}>
                    <Flex>
                        <Tooltip
                            label="Displays direct Explorer/Content Editor link for data source items in the 'Assign Content Item' dialog">
                            <FormLabel htmlFor='datasourceSwitch'>
                                Enable Datasource Viewer:
                            </FormLabel>
                        </Tooltip>
                        <Spacer />
                        <Switch
                            id='datasourceSwitch'
                            isChecked={datasourceEnabled}
                            onChange={handleSwitchChange}
                        />

                    </Flex>
                </FormControl>
                {/* Additional feature switches can be added here */}
            </Box>
            <Wrap>
            </Wrap>
        </Stack>
    );
};

export default Settings;
