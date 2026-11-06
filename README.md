# 알라딘 DOS

[알라딘 플레이](https://meetrick.github.io/alladin-web/)

주소를 열면 GitHub Pages에 포함된 DOS 게임이 자동으로 실행됩니다. 세로 모드에서는 게임 아래에 버튼이 있고, 가로 모드에서는 왼쪽에 방향키, 오른쪽에 점프·칼·사과 버튼이 있습니다. 화면 비율은 4:3입니다.

게임을 실행하면 단어 확인 화면을 자동으로 지나 오프닝이 시작됩니다.

## 로컬 실행

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

[로컬 플레이어](http://127.0.0.1:8765/)를 엽니다. 에뮬레이터는 [js-dos](https://js-dos.com/) CDN에서 불러옵니다.

## 번들 생성과 배포

`sh scripts/pack-game.sh --patched`로 배포용 `docs/aladdin.jsdos`를 만듭니다. 설치 디스크의 데이터와 로컬 `alladin/`에 이미 패치된 실행 파일을 사용합니다. 게임 폴더가 다른 위치에 있으면 `--patched` 뒤에 경로를 지정하세요. 설치 디스크를 읽으려면 LHa를 지원하는 tar가 필요합니다. 게임 번들을 갱신할 때는 `docs/game.js`의 번들 URL 버전도 올리세요.

GitHub Pages는 `main` 브랜치의 `/docs` 폴더를 게시합니다. [GitHub Pages 설정 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
