# Changelog

## [3.0.0](https://github.com/woodnx/iQbe/compare/v2.2.1...v3.0.0) (2024-08-08)


### ⚠ BREAKING CHANGES

* **api:** !

### Features

* **api:** @api/typesでのオプショナルなプロパティに対してNullableを追加 ([c3b717f](https://github.com/woodnx/iQbe/commit/c3b717f386d4cf72260cd54c59fa02067dfaab0a))
* **api:** auth/tokenの追加 ([88fa9ec](https://github.com/woodnx/iQbe/commit/88fa9ec596cca60ad8cebcc02be9e927f727788f))
* **api:** Create package: api ([e3c7249](https://github.com/woodnx/iQbe/commit/e3c72493605fa139e8f810d023187964e991b386))
* **backend:** Add script setting unique id ([1749806](https://github.com/woodnx/iQbe/commit/17498063a0787793c0b90cfab957fd5f99d987bb))
* **backend:** Add user exsitence check ([f30c1fe](https://github.com/woodnx/iQbe/commit/f30c1fef5b350808b4419fcf62218bb7db9fd294))
* **backend:** OpenAPI定義に従ったAPIに変更 ([feefe1b](https://github.com/woodnx/iQbe/commit/feefe1bb96b7f6cb7378372c42ee7bf59add9ced))
* **backend:** quizzesテーブルにcategoryおよびsub_categoryカラムを追加 ([5fc9ea6](https://github.com/woodnx/iQbe/commit/5fc9ea60dbf540841e2165e989a6cd9abeefa7c0))
* **backend:** 各種パッケージの追加 ([b8b0f53](https://github.com/woodnx/iQbe/commit/b8b0f538e0c45ee6cce15b0bcc323b3538c86997))
* **frontend:** Add welcome page ([8b7a826](https://github.com/woodnx/iQbe/commit/8b7a82651ab7aa92f64c0b877b97062251720608))
* **frontend:** aspidaに対応 ([cb96826](https://github.com/woodnx/iQbe/commit/cb96826fe44a947b8a08daad5101684cfc6199ec))
* **frontend:** change font to Note Sans JP ([ebb3474](https://github.com/woodnx/iQbe/commit/ebb3474c8713afbee665c46c2de5767b5f00ff11))
* **frontend:** postメソッドをaspidaに対応 ([3a23115](https://github.com/woodnx/iQbe/commit/3a23115cfd6c27c655f9fcb5800b13f80c11cc31))
* support qid ([6e10d83](https://github.com/woodnx/iQbe/commit/6e10d835f0a4194481bb6295cf214869ec1db684))
* エイリアスの追加とnpm run apiの変更 ([38444e4](https://github.com/woodnx/iQbe/commit/38444e4701c9d8c4f288e4b7d576d375ebcfe57e))


### Bug Fixes

* **api:** backendから参照する際にエラーになってしまう問題を修正 ([4c414e8](https://github.com/woodnx/iQbe/commit/4c414e858c0e1e4ca9bf281dd1c37d952e29dcb5))
* **api:** optinalな値に対してundefinedを追加 ([213c350](https://github.com/woodnx/iQbe/commit/213c3501754892889f835c15f2bdca1b43ffcbd7))
* **api:** QuizスキーマのregisteredMylistsの型が指定されていなかった問題を修正 ([88285cc](https://github.com/woodnx/iQbe/commit/88285cce71eb79c31458bd73fa70c070a786281c))
* **api:** いろいろ修正 ([708c708](https://github.com/woodnx/iQbe/commit/708c7087efdd1a32fe809837c3fcbc67e96bd4bf))
* **api:** キャメルケースだったところをスネークケースに変更 ([9d1aabf](https://github.com/woodnx/iQbe/commit/9d1aabf0d4c479ac510c2070583d8bcffbf0bf44))
* **api:** スキーマ定義や型の修正 ([7c44026](https://github.com/woodnx/iQbe/commit/7c44026511d5942ae420d5bf30fc7f4bd8bb0e2a))
* **api:** そぐわないAPI定義の修正 ([5ccc396](https://github.com/woodnx/iQbe/commit/5ccc396a9fa8182a81dc751f1f33aee738ce5f83))
* **api:** パッケージをバンドリングするように変更 ([f056df4](https://github.com/woodnx/iQbe/commit/f056df41f1c58031b49d287f7a9e7d8431cc0f53))
* **api:** 不自然なAPI定義を修正 ([7dd2c6f](https://github.com/woodnx/iQbe/commit/7dd2c6fd85c707c5cd6a191569fe7f94052199a1))
* **backend:** fix typo ([8dcd781](https://github.com/woodnx/iQbe/commit/8dcd781687e57f14fc90924125d9a1af0feb3bff))
* **frontend:** backendの変更に関わる調整 ([12c9b54](https://github.com/woodnx/iQbe/commit/12c9b540270d491ce73c2fb75f285bfc32820784))
* **frontend:** CSSを適用 ([5408f7b](https://github.com/woodnx/iQbe/commit/5408f7b1de64eab5feb2a1c0bd822aa55727b0eb))
* **frontend:** Fix deprecated props ([185a9af](https://github.com/woodnx/iQbe/commit/185a9af970f6f9f578c25b01e8a33dd650f60284))
* **frontend:** マイリストや問題集の名前を変える際，モーダルが閉じてしまう問題を修正 ([5269bd2](https://github.com/woodnx/iQbe/commit/5269bd267fc76b7ab8679c49aa579b39140cc42a))
