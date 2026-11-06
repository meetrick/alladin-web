# 알라딘 DOS

[알라딘 플레이](https://meetrick.github.io/alladin-web/)

주소를 열면 GitHub Pages에 포함된 DOS 게임이 자동으로 실행됩니다. 세로 모드에서는 게임 아래에 버튼이 있고, 가로 모드에서는 왼쪽에 방향키, 오른쪽에 점프·칼·사과 버튼이 있습니다. 화면 비율은 4:3입니다.

원본 DOS판이 설명서의 영문 단어를 요구하면 게임 화면에 표시된 위치를 확인하세요. 휴대폰에서는 **영문 키보드**를 열어 입력할 수 있습니다.

## 로컬 실행

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

[로컬 플레이어](http://127.0.0.1:8765/)를 엽니다. 에뮬레이터는 [js-dos](https://js-dos.com/) CDN에서 불러옵니다.

## 번들 생성과 배포

`sh scripts/pack-game.sh`를 실행하면 로컬 `alladin/`의 설치 디스크 또는 설치된 DOS 게임 파일로 `docs/aladdin.jsdos`를 만듭니다. 기본 위치가 다르면 스크립트의 첫 번째 인자로 게임 폴더를 지정하세요. 설치 디스크를 읽으려면 LHa를 지원하는 tar가 필요합니다. 게임 번들을 갱신할 때는 `docs/game.js`의 번들 URL 버전도 올리세요.

GitHub Pages는 `main` 브랜치의 `/docs` 폴더를 게시합니다. [GitHub Pages 설정 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
