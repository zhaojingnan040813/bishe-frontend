import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PromptCard from '../PromptCard.vue'

describe('PromptCard', () => {
    // 测试提示词列表渲染
    describe('提示词列表渲染', () => {
        it('应该渲染默认提示词列表', () => {
            const wrapper = mount(PromptCard)
            const promptCards = wrapper.findAll('.prompt-card')

            expect(promptCards.length).toBeGreaterThanOrEqual(3)
        })

        it('应该正确显示默认提示词内容', () => {
            const wrapper = mount(PromptCard)
            const promptTexts = wrapper.findAll('.prompt-text')

            expect(promptTexts[0].text()).toBe('头孢和酒精在一起服用会有哪些副作用？')
            expect(promptTexts[1].text()).toBe('为什么咖啡因不能和安眠药一起服用？')
            expect(promptTexts[2].text()).toBe('牛奶不能与哪些抗生素一起服用？')
        })

        it('应该渲染自定义提示词列表', () => {
            const customPrompts = ['问题1', '问题2', '问题3', '问题4']
            const wrapper = mount(PromptCard, {
                props: { prompts: customPrompts }
            })
            const promptCards = wrapper.findAll('.prompt-card')

            expect(promptCards.length).toBe(4)
            expect(wrapper.findAll('.prompt-text')[0].text()).toBe('问题1')
        })

        it('当传入空数组时应该使用默认提示词', () => {
            const wrapper = mount(PromptCard, {
                props: { prompts: [] }
            })
            const promptCards = wrapper.findAll('.prompt-card')

            expect(promptCards.length).toBe(3)
        })
    })

    // 测试点击事件触发
    describe('点击事件触发', () => {
        it('点击提示词卡片应该触发select事件', async () => {
            const wrapper = mount(PromptCard)
            const firstCard = wrapper.find('.prompt-card')

            await firstCard.trigger('click')

            expect(wrapper.emitted('select')).toBeTruthy()
            expect(wrapper.emitted('select')![0]).toEqual(['头孢和酒精在一起服用会有哪些副作用？'])
        })

        it('点击不同提示词应该传递对应的提示词内容', async () => {
            const wrapper = mount(PromptCard)
            const cards = wrapper.findAll('.prompt-card')

            await cards[1].trigger('click')

            expect(wrapper.emitted('select')![0]).toEqual(['为什么咖啡因不能和安眠药一起服用？'])
        })

        it('点击自定义提示词应该传递正确的内容', async () => {
            const customPrompts = ['自定义问题A', '自定义问题B']
            const wrapper = mount(PromptCard, {
                props: { prompts: customPrompts }
            })
            const firstCard = wrapper.find('.prompt-card')

            await firstCard.trigger('click')

            expect(wrapper.emitted('select')![0]).toEqual(['自定义问题A'])
        })
    })

    // 测试默认提示词数量（至少3个）
    describe('默认提示词数量', () => {
        it('默认提示词数量应该至少为3个', () => {
            const wrapper = mount(PromptCard)
            const promptCards = wrapper.findAll('.prompt-card')

            expect(promptCards.length).toBeGreaterThanOrEqual(3)
        })
    })
})
