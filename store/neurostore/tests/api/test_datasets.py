def test_post_and_get_datasets(auth_client, ingest_neurosynth):
    # create a dataset
    payload = auth_client.get("/api/studies/").json
    study_ids = [study['id'] for study in payload['results']]
    post_data = {
        "name": "rock road",
        "description": "mah ice cram",
        "studies": study_ids,
    }
    post_resp = auth_client.post("/api/datasets/", data=post_data)
    assert post_resp.status_code == 200

    get_resp = auth_client.get("/api/datasets/")

    assert next(
        d for d in get_resp.json['results'] if d['name'] == "rock road"
        ) == post_resp.json