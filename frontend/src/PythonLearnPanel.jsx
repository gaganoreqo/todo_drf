import { useMemo, useState } from 'react'
import {
  pythonAdvancedRows,
  pythonGlossary,
  pythonInterviewQuestions,
  pythonLearningTopics,
  pythonOopTopics,
} from './pythonLearnContent.js'

const PYTHON_SECTIONS = [
  {
    id: 'topics',
    label: 'Topic Lessons',
  },
  {
    id: 'oops',
    label: 'OOPs',
  },
  {
    id: 'advanced',
    label: 'Advanced',
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

function PythonLearnPanel() {
  const [activeSection, setActiveSection] = useState('topics')
  const [activeTopicId, setActiveTopicId] = useState(pythonLearningTopics[0].id)
  const [activeOopId, setActiveOopId] = useState(pythonOopTopics[0].id)
  const activeTopic = useMemo(
    () => pythonLearningTopics.find((topic) => topic.id === activeTopicId),
    [activeTopicId],
  )
  const activeOopTopic = useMemo(
    () => pythonOopTopics.find((topic) => topic.id === activeOopId),
    [activeOopId],
  )

  return (
    <section className="learn-shell" aria-label="Python learning center">
      <aside className="learn-sidebar" aria-label="Python learn navigation">
        <div className="learn-sidebar-head">
          <p className="eyebrow">Python Learn</p>
          <h2>Basic to Advanced</h2>
        </div>

        <div className="learn-switcher" aria-label="Python learning sections">
          {PYTHON_SECTIONS.map((section) => (
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
          <div className="learn-topic-list" aria-label="Python topics">
            {pythonLearningTopics.map((topic, index) => (
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

        {activeSection === 'oops' ? (
          <div className="learn-topic-list" aria-label="Python OOP topics">
            {pythonOopTopics.map((topic, index) => (
              <button
                key={topic.id}
                type="button"
                className={
                  activeOopId === topic.id
                    ? 'learn-topic-button active'
                    : 'learn-topic-button'
                }
                onClick={() => setActiveOopId(topic.id)}
              >
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{topic.title}</span>
                <small>OOPs</small>
              </button>
            ))}
          </div>
        ) : null}
      </aside>

      <div className="learn-content">
        {activeSection === 'topics' ? <TopicLesson topic={activeTopic} /> : null}
        {activeSection === 'oops' ? (
          <OopPage activeOopTopic={activeOopTopic} />
        ) : null}
        {activeSection === 'advanced' ? <AdvancedPage /> : null}
        {activeSection === 'terms' ? <TermsPage /> : null}
        {activeSection === 'interview' ? (
          <InterviewPage activeTopic={activeTopic} />
        ) : null}
      </div>
    </section>
  )
}

function TopicLesson({ topic }) {
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
        <InfoPanel title="Core Terms">
          <div className="term-list">
            {topic.terms.map(([term, meaning]) => (
              <article key={term} className="term-card">
                <strong>{term}</strong>
                <p>{meaning}</p>
              </article>
            ))}
          </div>
        </InfoPanel>

        <InfoPanel title="Concept Checklist">
          <ol className="learn-steps">
            {topic.concepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ol>
        </InfoPanel>
      </section>

      <InfoPanel title={topic.exampleTitle}>
        <CodeBlock code={topic.exampleCode} />
      </InfoPanel>
    </article>
  )
}

function OopPage({ activeOopTopic }) {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Python OOPs</p>
          <h2>{activeOopTopic.title}</h2>
          <p>{activeOopTopic.summary}</p>
        </div>
      </header>

      <section className="learn-grid two">
        <InfoPanel title="What to Learn">
          <ol className="learn-steps">
            {activeOopTopic.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </InfoPanel>

        <InfoPanel title="OOP Pillars">
          <div className="term-list">
            {[
              ['Encapsulation', 'Keep state changes controlled through methods and properties.'],
              ['Inheritance', 'Reuse and specialize behavior from a parent class.'],
              ['Polymorphism', 'Use different object types through the same expected behavior.'],
              ['Abstraction', 'Hide details behind a clear public contract.'],
            ].map(([term, meaning]) => (
              <article key={term} className="term-card">
                <strong>{term}</strong>
                <p>{meaning}</p>
              </article>
            ))}
          </div>
        </InfoPanel>
      </section>

      <InfoPanel title="Code Example">
        <CodeBlock code={activeOopTopic.code} />
      </InfoPanel>
    </article>
  )
}

function AdvancedPage() {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Advanced Python</p>
          <h2>Memory, Typing, Async, Testing, Internals</h2>
          <p>
            Learn the concepts that matter when Python code grows into real
            applications and production services.
          </p>
        </div>
      </header>

      <InfoPanel title="Advanced Concept Map">
        <div className="learn-table-wrap">
          <table className="learn-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {pythonAdvancedRows.map(([concept, meaning]) => (
                <tr key={concept}>
                  <td>{concept}</td>
                  <td>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoPanel>

      <section className="learn-grid two">
        <InfoPanel title="Practice Path">
          <ol className="learn-steps">
            <li>Build small scripts with clean functions.</li>
            <li>Refactor repeated logic into modules and packages.</li>
            <li>Write OOP classes for stateful domain behavior.</li>
            <li>Add tests for normal cases and edge cases.</li>
            <li>Use type hints and dataclasses for larger codebases.</li>
            <li>Use async only with async-compatible libraries.</li>
          </ol>
        </InfoPanel>

        <InfoPanel title="Backend Path">
          <ol className="learn-steps">
            <li>Learn Python basics and OOPs first.</li>
            <li>Learn files, exceptions, modules, and packages.</li>
            <li>Learn Django models, views, URLs, and templates.</li>
            <li>Learn DRF serializers, ViewSets, permissions, and auth.</li>
            <li>Learn deployment, testing, logging, and performance.</li>
          </ol>
        </InfoPanel>
      </section>
    </article>
  )
}

function TermsPage() {
  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Glossary</p>
          <h2>Python Terms</h2>
          <p>Important Python terms for code reading, debugging, and interviews.</p>
        </div>
      </header>

      <div className="glossary-grid">
        {pythonGlossary.map(([term, meaning]) => (
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
  const questions = [...activeTopic.interview, ...pythonInterviewQuestions]

  return (
    <article className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="eyebrow">Interview</p>
          <h2>{activeTopic.title}</h2>
          <p>Topic-wise Python questions plus core OOPs interview answers.</p>
        </div>
      </header>

      <InfoPanel title="Python Questions">
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

function CodeBlock({ code }) {
  return (
    <pre className="learn-code">
      <code>{code}</code>
    </pre>
  )
}

export default PythonLearnPanel
