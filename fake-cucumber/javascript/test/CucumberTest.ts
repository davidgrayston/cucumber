import { MessageNotifier } from '../src/types'
import { IdGenerator, messages } from 'cucumber-messages'
import { gherkinMessages, streamToArray } from './TestHelpers'
import Cucumber from '../src/Cucumber'
import assert from 'assert'
import SupportCode from '../src/SupportCode'
import makeDummyStepDefinitions from './makeDummyStepDefinitions'
import makeDummyHooks from './makeDummyHooks'

describe('Cucumber', () => {
  it('runs tagged hooks', async () => {
    const feature = `Feature: hooks

  @before-passed
  Scenario: test
    Given a passed step
  `

    const gherkinMessageList = await streamToArray(
      gherkinMessages(feature, 'test.feature')
    )
    const supportCode = new SupportCode(IdGenerator.incrementing())
    makeDummyStepDefinitions(supportCode)
    makeDummyHooks(supportCode)
    const cucumber = new Cucumber(
      gherkinMessageList,
      supportCode.stepDefinitions,
      supportCode.hooks,
      IdGenerator.incrementing()
    )
    const messageList: messages.IEnvelope[] = []
    const notifier: MessageNotifier = message => messageList.push(message)
    await cucumber.execute(notifier)

    const testCase = messageList.find(m => m.testCase).testCase
    assert.strictEqual(testCase.testSteps.length, 2)
  })

  it('runs after hooks even when pickle steps fail')
})