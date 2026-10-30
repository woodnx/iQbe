<div align="center">
  <img src="./assets/iqbe.png" alt="iQbe logo" width="100" align="middle"/>
  <img src="./assets/iqbe-name.png" alt="iQbe logo" width="100" align="middle"/>
</div>

<div align="center">
  <strong>iQbe ― A powerful tool to enhance your quiz skills more fun and effective.</strong>
</div>

## Features
- INPUT
  - Search system organized by issues
  - Flexible refinement by genre, percentage of correct answers, and keywords
  - Features for sitting, such as shuffling and hiding answers

- OUTPUT
  - Exercises based on real competition scenarios

- CREATE
  - Easier to create questions
  - Import from CSV file

- ANALYZE
  - Visualize how much you have learned
  - Genre Charts by Individual
  - Review of problems you got wrong

- FOLLOW
  - Ranking of study status in the same circle

## Credits
This software uses following OSS.
- Envionment: [Node.js](https://nodejs.org/en)
- UI Library: [React](https://react.dev/)
- Routing System: [React Router](https://reactrouter.com/en/main)
- UI Framework: [Mantine](https://v6.mantine.dev/)
- Icons: [Tabler Icons](https://tablericons.com/)
- Server: [Hono](https://hono.dev/)

## API development

The backend Hono routes define the API contract. The frontend uses `hc<AppType>` from `hono/client` and infers request and JSON response types from `backend/rpc`. Run `pnpm typecheck` to build backend declarations and check the frontend; `pnpm dev` builds them initially and updates them while watching. `pnpm build` builds the backend before the frontend and assembles the static site. No schema generation step is needed.
