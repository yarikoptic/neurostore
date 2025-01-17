### Example Workflow

Dors is a first year graduate student assigned to get an overview of which brain regions are typically recruited
during finger tapping.
Dors recently heard about compose.neurosynth.org and decided to check the website out to see if it would be helpful
for her work.
Dors goes to the landing page and clicks on the right corner button to sign up and uses her google account.
From there she clicks on the studies tab to search for "finger tapping".

A few studies show up from the search and she begins to read a few of the associated articles.
If the study does indeed use a finger tapping task, she wants to keep track of those studies.
To the left of the study there is a plus button.
She clicks on the plus button and sees she can add the study to a "study-set".
She names the studyset "finger tapping" and adds the selected study.
When she is done reading and adding all relevent studies, she notices
that the finger tapping task typically falls under three categories:
1) right handed index finger,
2) right handed multiple fingers, and
3) both hands.

Using this information, she views her studyset and adds an annotation with three columns,
one for each type of finger tapping task: RH_index_finger, RH_multi_finger, and bimanual.
For each analysis in each study, Dors reads the tables reporting the brain coordinates
and marks the analysis as one of the three categories.

After marking each analysis, Dors proceeds to specify the meta-analysis.
Clicking on the meta-analysis tab, she is supplied with a form asking her
what type of meta-analysis to perform: Image-Based Meta-Analysis (IBMA) or
Coordinate-Based Meta-Analysis (CBMA).
Her studyset contains coordinates so Dors selects CBMA.
Next, she specifies the desired CBMA algorithm: multi-level kernel density analysis (or MKDA).
After that, she specifies the type of correction she wants to apply and then she's ready to run.

neurosynth-compose generates a unique id for the analysis and Dors follows the link to the google collab
to run her analysis.
She runs the cells in the notebook which uploads the results back to neurosynth-compose.
