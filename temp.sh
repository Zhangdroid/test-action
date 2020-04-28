curl -X POST https://api.github.com/repos/Zhangdroid/test-icons/dispatches \
-H 'Accept: application/vnd.github.v3+json' \
-H 'Authorization: token 8ca7632ef0be4ecb418f135d0f24d647ed2cfe35' \
--data '{"event_type": "CUSTOM_ACTION_NAME_HERE"}'