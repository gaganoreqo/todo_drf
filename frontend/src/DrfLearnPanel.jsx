import { useMemo, useState } from 'react'
import {
  drfComparisonRows,
  drfExtraInterviewQuestions,
  drfFileGuides,
  drfGlossary,
  drfLearningTopics,
  drfSetCrudExamples,
  drfTopicDeepDives,
  drfTopicSupplements,
  drfViewStyles,
  modelGuideSections,
  serializerGuideSections,
} from './drfLearnContent.js'

const LEARN_SECTIONS = [
  {
    id: 'topics',
    label: 'Topic Lessons',
  },
  {
    id: 'files',
    label: 'Project Files',
  },
  {
    id: 'sets',
    label: 'DRF Sets',
  },
  {
    id: 'terms',
    label: 'Terms',
  },
  {
    id: 'interview',
    label: 'Interview Q&A',
  },
]

const PROJECT_FILE_GUIDES = [
  {
    id: 'models',
    fileName: 'models.py',
    title: 'Model Fields, Data Types, Relationships',
  },
  {
    id: 'serializers',
    fileName: 'serializers.py',
    title: 'Validation, Custom create(), Custom update()',
  },
  ...drfFileGuides,
]

function DrfLearnPanel() {
  const [activeSection, setActiveSection] = useState('topics')
  const [activeTopicId, setActiveTopicId] = useState(drfLearningTopics[0].id)
  const [activeViewStyleId, setActiveViewStyleId] = useState(drfViewStyles[0].id)
  const [activeFileGuideId, setActiveFileGuideId] = useState(
    PROJECT_FILE_GUIDES[0].id,
  )
  const activeTopic = useMemo(
    () => drfLearningTopics.find((topic) => topic.id === activeTopicId),
    [activeTopicId],
  )
  const activeViewStyle = useMemo(
    () => drfViewStyles.find((style) => style.id === activeViewStyleId),
    [activeViewStyleId],
  )
  const activeFileGuide = useMemo(
    () => PROJECT_FILE_GUIDES.find((guide) => guide.id === activeFileGuideId),
    [activeFileGuideId],
  )

  return (
    <section className="learn-shell" aria-label="DRF learning center">
      <aside className="learn-sidebar" aria-label="DRF learn navigation">
        <div className="learn-sidebar-head">
          <p className="eyebrow">DRF Learn</p>
          <h2>Basic to Advanced</h2>
        </div>

        <div className="learn-switcher" aria-label="Learning sections">
          {LEARN_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={
                activeSection === section.id
                  ? 'learn-section-button active'
                  : 'learn-section-button'
              }
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === 'topics' || activeSection === 'interview' ? (
          <div className="learn-topic-list" aria-label="DRF topics">
            {drfLearningTopics.map((topic, index) => (
              <button
                key={topic.id}
                type="button"
                className={
                  activeTopicId === topic.id
                    ? 'learn-topic-button active'
                    : 'learn-topic-button'
                }
                onClick={() => setActiveTopicId(topic.id)}
              >
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{topic.title}</span>
                <small>{topic.level}</small>
              </button>
            ))}
          </div>
        ) : null}

        {activeSection === 'sets' ? (
          <div className="learn-topic-list" aria-label="DRF view styles">
            {drfViewStyles.map((style, index) => (
              <button
                key={style.id}
                type="button"
                className={
                  activeViewStyleId === style.id
                    ? 'learn-topic-button active'
                    : 'learn-topic-button'
                }
                onClick={() => setActiveViewStyleId(style.id)}
              >
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{style.shortName}</span>
                <small>{style.title}</small>
              </button>
            ))}
          </div>
        ) : null}

        {activeSection === 'files' ? (
          <div className="learn-topic-list" aria-label="DRF project files">
            {PROJECT_FILE_GUIDES.map((guide, index) => (
              <button
                key={guide.id}
                type="button"
                className={
                  activeFileGuideId === guide.id
                    ? 'learn-topic-button active'
                    : 'learn-topic-button'
                }
                onClick={() => setActiveFileGuideId(guide.id)}
              >
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{guide.fileName}</span>
                <small>{guide.title}</small>
              </button>
            ))}
          </div>
        ) : null}
      </aside>

      <div className="learn-content">
        {activeSection === 'topics' ? <TopicLesson topic={activeTopic} /> : null}
        {activeSection === 'sets' ? (
          <DrfSetsPage activeViewStyle={activeViewStyle} />
        ) : null}
        {activeSection === 'files' ? (
          <ProjectFilePage guide={activeFileGuide} />
        ) : null}
        {activeSection === 'terms' ? <TermsPage /> : null}
        {activeSection === 'interview' ? (
          <InterviewPage activeTopic={activeTopic} />
        ) : null}
      </div>
    </section>
  )
}

function TopicLesson({ topic }) {
  const deepDives = drfTopicDeepDives[topic.id] || []
  const supplement = drfTopicSupplements[topic.id]

  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">{topic.level}</p>
          <h2>{topic.title}</h2>
          <p>{topic.goal}</p>
        </div>
      </header>

      <section className="learn-grid two">
        <InfoPanel title="Term Notes">
          <div className="term-list">
            {topic.terms.map((item) => (
              <article key={item.term} className="term-card">
                <strong>{item.term}</strong>
                <p>{item.meaning}</p>
              </article>
            ))}
          </div>
        </InfoPanel>

        <InfoPanel title="How It Works">
          <ol className="learn-steps">
            {topic.flow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </InfoPanel>
      </section>

      <InfoPanel title="Detailed Explanation">
        <div className="detail-grid">
          {deepDives.map((item) => (
            <article key={item.title} className="detail-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </InfoPanel>

      {supplement ? (
        <section className="learn-grid two">
          <InfoPanel title="Must Know">
            <ul className="learn-steps">
              {supplement.mustKnow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </InfoPanel>

          <InfoPanel title="Common Mistakes">
            <ul className="learn-steps">
              {supplement.mistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </InfoPanel>
        </section>
      ) : null}

      {supplement?.practiceCode ? (
        <InfoPanel title={supplement.practiceTitle}>
          <CodeBlock code={supplement.practiceCode} />
        </InfoPanel>
      ) : null}

      <InfoPanel title={topic.exampleTitle}>
        <CodeBlock code={topic.exampleCode} />
      </InfoPanel>

    </article>
  )
}

function DrfSetsPage({ activeViewStyle }) {
  const crudExample = drfSetCrudExamples[activeViewStyle.id]

  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">DRF Sets</p>
          <h2>FBV, CBV, GenericAPIView, Mixins, Generics, ViewSets, ModelViewSet</h2>
          <p>
            Choose lower abstraction for custom control and higher abstraction for
            repeatable CRUD APIs.
          </p>
        </div>
      </header>

      <InfoPanel title="Quick Difference Table">
        <div className="learn-table-wrap">
          <table className="learn-table">
            <thead>
              <tr>
                <th>Style</th>
                <th>Abstraction</th>
                <th>URLs</th>
                <th>CRUD</th>
                <th>Best Use</th>
              </tr>
            </thead>
            <tbody>
              {drfComparisonRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.abstraction}</td>
                  <td>{row.urls}</td>
                  <td>{row.crud}</td>
                  <td>{row.bestUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoPanel>

      <section className="learn-grid two">
        <InfoPanel title={activeViewStyle.title}>
          <p className="learn-copy">{activeViewStyle.summary}</p>
          <dl className="learn-definition-list">
            <div>
              <dt>Best for</dt>
              <dd>{activeViewStyle.bestFor}</dd>
            </div>
            <div>
              <dt>Method handling</dt>
              <dd>{activeViewStyle.methods}</dd>
            </div>
          </dl>
        </InfoPanel>

        <InfoPanel title="Pros and Cons">
          <div className="pros-cons">
            <div>
              <h3>Pros</h3>
              <ul>
                {activeViewStyle.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Cons</h3>
              <ul>
                {activeViewStyle.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </InfoPanel>
      </section>

      <InfoPanel title={`${activeViewStyle.shortName} Example`}>
        <CodeBlock code={activeViewStyle.exampleCode} />
      </InfoPanel>

      <InfoPanel title={`${activeViewStyle.shortName} Full CRUD Example`}>
        <div className="crud-operation-grid">
          <OperationBadge label="List" method="GET" />
          <OperationBadge label="Create" method="POST" />
          <OperationBadge label="Get by ID" method="GET" />
          <OperationBadge label="Update" method="PUT" />
          <OperationBadge label="Partial Update" method="PATCH" />
          <OperationBadge label="Delete" method="DELETE" />
        </div>
        <CodeBlock code={crudExample} />
      </InfoPanel>

      <InfoPanel title="Interview Answer">
        <QuestionAnswer item={activeViewStyle.interview} />
      </InfoPanel>
    </article>
  )
}

function ModelsGuidePage() {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">models.py</p>
          <h2>Model Fields, Data Types, Relationships</h2>
          <p>
            Learn how Django model syntax maps Python classes to database tables,
            columns, constraints, and relationships.
          </p>
        </div>
      </header>

      <InfoPanel title="Core Explanation">
        <div className="detail-grid">
          {modelGuideSections.overview.map((item) => (
            <article key={item.title} className="detail-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </InfoPanel>

      <section className="learn-grid two">
        <InfoPanel title="Must Know">
          <ul className="learn-steps">
            {modelGuideSections.mustKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel title="Common Mistakes">
          <ul className="learn-steps">
            {modelGuideSections.mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>
      </section>

      <InfoPanel title="Model Field Data Types">
        <div className="field-type-grid">
          {modelGuideSections.fieldGroups.map((group) => (
            <article key={group.title} className="term-card">
              <h3>{group.title}</h3>
              <dl className="compact-definition-list">
                {group.fields.map(([name, meaning]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{meaning}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </InfoPanel>

      <InfoPanel title="Common Field Options">
        <div className="learn-table-wrap">
          <table className="learn-table">
            <thead>
              <tr>
                <th>Option</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {modelGuideSections.optionRows.map(([option, use]) => (
                <tr key={option}>
                  <td>{option}</td>
                  <td>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoPanel>

      {modelGuideSections.examples.map((example) => (
        <InfoPanel key={example.title} title={example.title}>
          <CodeBlock code={example.code} />
        </InfoPanel>
      ))}
    </article>
  )
}

function SerializersGuidePage() {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">serializers.py</p>
          <h2>Validation, Custom create(), Custom update()</h2>
          <p>
            Learn how serializers validate request data, expose response fields,
            and control save behavior for normal and nested APIs.
          </p>
        </div>
      </header>

      <InfoPanel title="Core Explanation">
        <div className="detail-grid">
          {serializerGuideSections.overview.map((item) => (
            <article key={item.title} className="detail-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </InfoPanel>

      <section className="learn-grid two">
        <InfoPanel title="Must Know">
          <ul className="learn-steps">
            {serializerGuideSections.mustKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel title="Common Mistakes">
          <ul className="learn-steps">
            {serializerGuideSections.mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>
      </section>

      <InfoPanel title="Serializer Concepts">
        <div className="glossary-grid">
          {serializerGuideSections.concepts.map(([term, meaning]) => (
            <article key={term} className="term-card">
              <strong>{term}</strong>
              <p>{meaning}</p>
            </article>
          ))}
        </div>
      </InfoPanel>

      {serializerGuideSections.examples.map((example) => (
        <InfoPanel key={example.title} title={example.title}>
          <CodeBlock code={example.code} />
        </InfoPanel>
      ))}
    </article>
  )
}

function ProjectFilePage({ guide }) {
  if (guide.id === 'models') {
    return <ModelsGuidePage />
  }

  if (guide.id === 'serializers') {
    return <SerializersGuidePage />
  }

  return <FileGuidePage guide={guide} />
}

function FileGuidePage({ guide }) {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">{guide.fileName}</p>
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
        </div>
      </header>

      <section className="learn-grid two">
        <InfoPanel title="Must Know">
          <ul className="learn-steps">
            {guide.mustKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>

        <InfoPanel title="Common Mistakes">
          <ul className="learn-steps">
            {guide.mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoPanel>
      </section>

      {guide.examples.map((example) => (
        <InfoPanel key={example.title} title={example.title}>
          <CodeBlock code={example.code} />
        </InfoPanel>
      ))}
    </article>
  )
}

function TermsPage() {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Glossary</p>
          <h2>DRF Terms</h2>
          <p>Important terms you should recognize in code, tests, and interviews.</p>
        </div>
      </header>

      <div className="glossary-grid">
        {drfGlossary.map(([term, meaning]) => (
          <article key={term} className="term-card">
            <strong>{term}</strong>
            <p>{meaning}</p>
          </article>
        ))}
      </div>
    </article>
  )
}

function InterviewPage({ activeTopic }) {
  const questions = [
    ...activeTopic.interview,
    ...(drfExtraInterviewQuestions[activeTopic.id] || []),
  ]

  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Interview</p>
          <h2>{activeTopic.title}</h2>
          <p>Topic-wise questions and answers for the selected DRF topic.</p>
        </div>
      </header>

      <InfoPanel title="Topic Questions">
        <div className="qa-list">
          {questions.map((item) => (
            <QuestionAnswer key={item.q} item={item} />
          ))}
        </div>
      </InfoPanel>
    </article>
  )
}

function InfoPanel({ title, children }) {
  return (
    <section className="learn-card">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function QuestionAnswer({ item }) {
  return (
    <article className="qa-card">
      <h3>{item.q}</h3>
      <p>{item.a}</p>
    </article>
  )
}

function OperationBadge({ label, method }) {
  return (
    <span className={`operation-badge ${method.toLowerCase()}`}>
      <strong>{method}</strong>
      {label}
    </span>
  )
}

function CodeBlock({ code }) {
  return (
    <pre className="learn-code">
      <code>{code}</code>
    </pre>
  )
}

export default DrfLearnPanel
