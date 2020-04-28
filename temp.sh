curl -X POST https://api.github.com/repos/Zhangdroid/test-icons/dispatches \
-H 'Accept: application/vnd.github.v3+json' \
-H 'Authorization: token 3e6db3bc8981a06b77a0779b8dd5602a7dbd36b3' \
--data '{"event_type": "CUSTOM_ACTION_NAME_HERE"}'