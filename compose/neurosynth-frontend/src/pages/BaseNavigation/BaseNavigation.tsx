import React, { Suspense } from 'react';
import { Box } from '@mui/material';
import { Switch, Route } from 'react-router-dom';
import LandingPage from '../LandingPage/LandingPage';
import BaseNavigationStyles from './BaseNavigation.styles';
import ProgressLoader from 'components/ProgressLoader/ProgressLoader';
import NotFoundPage from 'pages/NotFound/NotFoundPage';
import ProjectPage from 'pages/Projects/ProjectPage/ProjectPage';
import ExtractionPage from 'pages/ExtractionPage/ExtractionPage';
import CurationImportPage from 'pages/CurationPage/CurationImportPage';
import AnnotationsPage from 'pages/Annotations/AnnotationsPage/AnnotationsPage';
import ProjectStudyPage from 'pages/Studies/ProjectStudyPage/ProjectStudyPage';

const StudysetPage = React.lazy(() => import('../Studysets/StudysetPage/StudysetPage'));
const StudysetsPage = React.lazy(() => import('../Studysets/StudysetsPage/StudysetsPage'));
const EditStudyPage = React.lazy(() => import('../Studies/EditStudyPage/EditStudyPage'));
const StudiesPage = React.lazy(() => import('../Studies/StudiesPage/StudiesPage'));
const StudyPage = React.lazy(() => import('../Studies/StudyPage/StudyPage'));

const MetaAnalysesPage = React.lazy(
    () => import('../MetaAnalyses/MetaAnalysesPage/MetaAnalysesPage')
);
const MetaAnalysisPage = React.lazy(
    () => import('../MetaAnalyses/MetaAnalysisPage/MetaAnalysisPage')
);

const ProjectsPage = React.lazy(() => import('../Projects/ProjectsPage/ProjectsPage'));

const CurationPage = React.lazy(() => import('../CurationPage/CurationPage'));

const BaseNavigation: React.FC = (_props) => {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        margin: '2rem 0',
                    }}
                >
                    <ProgressLoader />
                </div>
            }
        >
            <Switch>
                <Route path="/" exact={true}>
                    <LandingPage />
                </Route>
                <Route path="/projects" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <ProjectsPage />
                    </Box>
                </Route>
                <Route path="/projects/:projectId/curation" exact>
                    <Box sx={BaseNavigationStyles.curationPageContainer}>
                        <CurationPage />
                    </Box>
                </Route>
                <Route path="/projects/:projectId/curation/import" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <CurationImportPage />
                    </Box>
                </Route>
                <Route path="/projects/:projectId/extraction" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <ExtractionPage />
                    </Box>
                </Route>
                <Route path="/projects/:projectId/extraction/annotations" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <AnnotationsPage />
                    </Box>
                </Route>
                <Route
                    path={[
                        '/projects/:projectId/extraction/studies/:studyId/edit',
                        '/studies/:studyId/edit',
                    ]}
                    exact
                >
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <EditStudyPage />
                    </Box>
                </Route>
                <Route path={'/projects/:projectId/extraction/studies/:studyId'}>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <ProjectStudyPage />
                    </Box>
                </Route>
                <Route
                    path={[
                        '/meta-analyses/:metaAnalysisId',
                        `/projects/:projectId/meta-analyses/:metaAnalysisId`,
                    ]}
                    exact
                >
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <MetaAnalysisPage />
                    </Box>
                </Route>
                <Route path="/projects/:projectId">
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <ProjectPage />
                    </Box>
                </Route>
                <Route path="/studysets" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <StudysetsPage />
                    </Box>
                </Route>
                <Route path="/studysets/:studysetId" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <StudysetPage />
                    </Box>
                </Route>
                <Route path="/studies" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <StudiesPage />
                    </Box>
                </Route>
                <Route path={'/studies/:studyId'} exact={true}>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <StudyPage />
                    </Box>
                </Route>
                <Route path="/meta-analyses" exact>
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <MetaAnalysesPage />
                    </Box>
                </Route>
                <Route path="*">
                    <Box sx={BaseNavigationStyles.pagesContainer}>
                        <NotFoundPage />
                    </Box>
                </Route>
            </Switch>
        </Suspense>
    );
};

export default BaseNavigation;
