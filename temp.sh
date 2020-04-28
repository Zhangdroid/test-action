curl -X POST https://api.github.com/repos/Zhangdroid/test-icons/dispatches \
-H 'Accept: application/vnd.github.v3+json' \
-H 'Authorization: token 69736983eb1e82c8e3c3aec04353e2745ce9977a' \
--data '{"event_type": "CUSTOM_ACTION_NAME_HERE"}'