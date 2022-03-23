def test_post_and_get_studysets(auth_client, ingest_neurosynth):
    # create a studyset
    payload = auth_client.get("/api/studies/").json
    study_ids = [study['id'] for study in payload['results']]
    post_data = {
        "name": "rock road",
        "description": "mah ice cram",
        "studies": study_ids,
    }
    post_resp = auth_client.post("/api/studysets/", data=post_data)
    assert post_resp.status_code == 200

    get_resp = auth_client.get("/api/studysets/")

    assert next(
        d for d in get_resp.json['results'] if d['name'] == "rock road"
        ) == post_resp.json


def test_add_study_to_studyset(auth_client, ingest_neurosynth):
    payload = auth_client.get("/api/studies/").json
    study_ids = [study['id'] for study in payload['results']]
    post_data = {
        "name": "rock road",
        "description": "mah ice cram",
        "studies": study_ids[:-1],
    }
    post_resp = auth_client.post("/api/studysets/", data=post_data)
    assert post_resp.status_code == 200

    dset_id = post_resp.json['id']

    put_resp = auth_client.put(f"/api/studysets/{dset_id}", data={"studies": study_ids})
    assert put_resp.status_code == 200