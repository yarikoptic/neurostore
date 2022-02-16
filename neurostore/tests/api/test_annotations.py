from ...models import Dataset, User

import pytest


def test_post_annotation(auth_client, ingest_neurosynth):
    dset = Dataset.query.first()
    # y for x in non_flat for y in x
    data = [
        {'study': s.id, 'analysis': a.id, 'note': {'foo': a.id}}
        for s in dset.studies for a in s.analyses
    ]
    payload = {
        'dataset': dset.id, 'notes': data, 'note_keys': {'foo': 'string'}, 'name': 'mah notes'
    }
    resp = auth_client.post('/api/annotations/', data=payload)
    assert resp.status_code == 200


def test_get_annotations(auth_client, ingest_neurosynth):
    import pandas as pd
    from io import StringIO

    dset = Dataset.query.first()
    resp = auth_client.get(f'/api/annotations/?dataset_id={dset.id}')
    assert resp.status_code == 200

    annot_id = resp.json['results'][0]['id']

    annot = auth_client.get(f"/api/annotations/{annot_id}")
    assert annot.status_code == 200

    annot_export = auth_client.get(f"/api/annotations/{annot_id}?export=true")

    assert annot_export.status_code == 200

    df = pd.read_csv(StringIO(annot_export.json['annotation_csv']))

    assert isinstance(df, pd.DataFrame)


def test_clone_annotation(auth_client, simple_neurosynth_annotation):
    annotation_entry = simple_neurosynth_annotation
    resp = auth_client.post(f"/api/annotations/?source_id={annotation_entry.id}", data={})
    assert resp.status_code == 200
    data = resp.json
    assert data['name'] == annotation_entry.name
    assert data['source_id'] == annotation_entry.id
    assert data['source'] == 'neurostore'


def test_single_analysis_delete(auth_client, user_data):
    user = User.query.filter_by(name="user1").first()
    # get relevant dataset
    datasets = auth_client.get(f"/api/datasets/?user_id={user.external_id}")
    dataset_id = datasets.json['results'][0]['id']
    dataset = auth_client.get(f"/api/datasets/{dataset_id}")
    # get relevant annotation
    annotations = auth_client.get(f"/api/annotations/?dataset_id={dataset_id}")
    annotation_id = annotations.json['results'][0]['id']
    annotation = auth_client.get(f"/api/annotations/{annotation_id}")
    # pick study to edit
    study_id = dataset.json['studies'][0]
    study = auth_client.get(f"/api/studies/{study_id}")

    # select analysis to delete
    analysis_id = study.json['analyses'][0]
    auth_client.delete(f"/api/analyses/{analysis_id}")

    # test if annotations were updated
    updated_annotation = auth_client.get(f"/api/annotations/{annotation_id}")

    assert updated_annotation.status_code == 200
    assert (len(annotation.json['notes']) - 1) == (len(updated_annotation.json['notes']))


def test_study_removal_from_dataset(auth_client, session, user_data):
    user = User.query.filter_by(name="user1").first()
    # get relevant dataset
    datasets = auth_client.get(f"/api/datasets/?user_id={user.external_id}")
    dataset_id = datasets.json['results'][0]['id']
    dataset = auth_client.get(f"/api/datasets/{dataset_id}")
    # get relevant annotation
    annotations = auth_client.get(f"/api/annotations/?dataset_id={dataset_id}")
    annotation_id = annotations.json['results'][0]['id']
    annotation = auth_client.get(f"/api/annotations/{annotation_id}")
    # remove study from dataset
    studies = dataset.json['studies']
    studies.pop()

    # update dataset
    auth_client.put(
        f"/api/datasets/{dataset_id}", data={'studies': studies}
    )

    # test if annotations were updated
    updated_annotation = auth_client.get(f"/api/annotations/{annotation_id}")

    assert updated_annotation.status_code == 200
    assert (len(annotation.json['notes']) - 1) == (len(updated_annotation.json['notes']))


def test_study_addition_to_dataset(auth_client, session, user_data):
    user = User.query.filter_by(name="user1").first()
    # get relevant dataset
    datasets = auth_client.get(f"/api/datasets/?user_id={user.external_id}")
    dataset_id = datasets.json['results'][0]['id']
    dataset = auth_client.get(f"/api/datasets/{dataset_id}")
    # get relevant annotation
    annotations = auth_client.get(f"/api/annotations/?dataset_id={dataset_id}")
    annotation_id = annotations.json['results'][0]['id']
    annotation = auth_client.get(f"/api/annotations/{annotation_id}")
    # add a new study
    studies = dataset.json['studies']
    user2 = User.query.filter_by(name="user2").first()
    studies_u2 = auth_client.get(f"/api/studies/?user_id={user2.external_id}")
    studies_u2_ids = [s['id'] for s in studies_u2.json['results']]
    studies.extend(studies_u2_ids)

    # update dataset
    auth_client.put(
        f"/api/datasets/{dataset_id}", data={'studies': studies}
    )

    # test if annotations were updated
    updated_annotation = auth_client.get(f"/api/annotations/{annotation_id}")

    assert updated_annotation.status_code == 200
    assert (len(annotation.json['notes']) + 1) == (len(updated_annotation.json['notes']))


def test_mismatched_notes(auth_client, ingest_neurosynth):
    dset = Dataset.query.first()
    # y for x in non_flat for y in x
    data = [
        {'study': s.id, 'analysis': a.id, 'note': {'foo': a.id, 'doo': s.id}}
        for s in dset.studies for a in s.analyses
    ]
    note_keys = {'foo': 'string', 'doo': 'string'}
    payload = {'dataset': dset.id, 'notes': data, 'note_keys': note_keys, 'name': 'mah notes'}

    # proper post
    annot = auth_client.post('/api/annotations/', data=payload)

    # additional key only added to one analysis
    data[0]['note']['bar'] = "not real!"
    with pytest.raises(ValueError):
        auth_client.post('/api/annotations/', data=payload)

    # incorrect key in one analysis
    data[0]['note'].pop('foo')
    with pytest.raises(ValueError):
        auth_client.post('/api/annotations/', data=payload)

    # update a single analysis with incorrect key
    bad_payload = {'notes': [data[0]]}
    with pytest.raises(ValueError):
        auth_client.put(f"/api/annotations/{annot.json['id']}", data=bad_payload)


# test push analysis id that does not exist
# Handle error better
def test_put_nonexistent_analysis(auth_client, ingest_neurosynth):
    dset = Dataset.query.first()
    # y for x in non_flat for y in x
    data = [
        {'study': s.id, 'analysis': a.id, 'note': {'foo': a.id, 'doo': s.id}}
        for s in dset.studies for a in s.analyses
    ]
    note_keys = {'foo': 'string', 'doo': 'string'}
    payload = {'dataset': dset.id, 'notes': data, 'note_keys': note_keys, 'name': 'mah notes'}

    # proper post
    annot = auth_client.post('/api/annotations/', data=payload)

    # have to pass all the notes even if only updating one attribute
    new_value = 'something new'
    data[0]['analysis'] = new_value
    bad_payload = {'notes': data}

    with pytest.raises(Exception):
        auth_client.put(f"/api/annotations/{annot.json['id']}", data=bad_payload)


def test_correct_note_overwrite(auth_client, ingest_neurosynth):
    dset = Dataset.query.first()
    # y for x in non_flat for y in x
    data = [
        {'study': s.id, 'analysis': a.id, 'note': {'foo': a.id, 'doo': s.id}}
        for s in dset.studies for a in s.analyses
    ]
    payload = {
        'dataset': dset.id,
        'notes': data,
        'note_keys': {'foo': 'string', 'doo': 'string'},
        'name': 'mah notes',
    }

    # proper post
    annot = auth_client.post('/api/annotations/', data=payload)

    # have to pass all the notes even if only updating one attribute
    new_value = 'something new'
    data[0]['note']['doo'] = new_value
    doo_payload = {'notes': data}
    put_resp = auth_client.put(f"/api/annotations/{annot.json['id']}", data=doo_payload)

    get_resp = auth_client.get(f"/api/annotations/{annot.json['id']}")

    assert len(put_resp.json['notes']) == len(data)
    assert get_resp.json == put_resp.json
    assert (
        get_resp.json['notes'][0]['note']['doo'] ==
        put_resp.json['notes'][0]['note']['doo'] == new_value
    )
