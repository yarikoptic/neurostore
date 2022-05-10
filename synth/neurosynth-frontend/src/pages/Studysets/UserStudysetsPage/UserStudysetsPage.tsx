import { useAuth0 } from '@auth0/auth0-react';
import { Box, Typography, Button } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { NeurosynthLoader, CreateDetailsDialog, Tables } from '../../../components';
import { GlobalContext, SnackbarType } from '../../../contexts/GlobalContext';
import useIsMounted from '../../../hooks/useIsMounted';
import API, { StudysetsApiResponse } from '../../../utils/api';

const UserStudysetsPage: React.FC = (props) => {
    const { user } = useAuth0();
    const [studysets, setStudysets] = useState<StudysetsApiResponse[]>();
    const { showSnackbar } = useContext(GlobalContext);
    const [createStudysetDialogIsOpen, setCreateStudysetDialogIsOpen] = useState(false);
    const isMountedRef = useIsMounted();

    useEffect(() => {
        const getStudysets = async () => {
            API.NeurostoreServices.StudySetsService.studysetsGet(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                false,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                user?.sub
            )
                .then((res) => {
                    if (isMountedRef.current && res?.data?.results) setStudysets(res.data.results);
                })
                .catch((err) => {
                    setStudysets([]);
                    console.error(err);
                });
        };

        getStudysets();
    }, [user?.sub, isMountedRef]);

    const handleCreateStudyset = async (name: string, description: string) => {
        API.NeurostoreServices.StudySetsService.studysetsPost({
            name,
            description,
        })
            .then((res) => {
                const newStudyset = res.data;
                setCreateStudysetDialogIsOpen(false);

                if (isMountedRef.current) {
                    setStudysets((prevState) => {
                        if (!prevState) return prevState;
                        const newState = [...prevState];
                        newState.push(newStudyset);
                        return newState;
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                showSnackbar('there was an error creating the studyset', SnackbarType.ERROR);
            });
    };

    return (
        <NeurosynthLoader loaded={!!studysets}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                }}
            >
                <Typography variant="h4">My Studysets</Typography>

                <Button variant="contained" onClick={() => setCreateStudysetDialogIsOpen(true)}>
                    Create new studyset
                </Button>
            </Box>

            <CreateDetailsDialog
                titleText="Create new Studyset"
                onCloseDialog={() => {
                    setCreateStudysetDialogIsOpen(false);
                }}
                onCreate={handleCreateStudyset}
                isOpen={createStudysetDialogIsOpen}
            />

            <Tables.StudysetsTable studysets={studysets || []} />
        </NeurosynthLoader>
    );
};

export default UserStudysetsPage;
