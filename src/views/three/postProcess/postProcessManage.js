class PostProcessManager {
  static instance = null

  constructor() {
    if (PostProcessManager.instance) {
      return PostProcessManager.instance
    }
    PostProcessManager.instance = this
    this.effects = {
      outline: {
        enabled: false,
        type: 'outline',
        priority: 1,
      },
      bloom: {
        enabled: false,
        type: 'bloom',
        priority: 2,
      },
      mask: {
        enabled: false,
        type: 'mask',
        priority: 3,
      },
      smaaPass: {
        enabled: false,
        type: 'smaaPass',
        priority: 4,
      },
      springBloom: {
        enabled: false,
        type: 'springBloom',
        priority: 5,
      },
      nightBloom: {
        enabled: false,
        type: 'nightBloom',
        priority: 5,
      },
    }
  }

  static getInstance() {
    if (!PostProcessManager.instance) {
      PostProcessManager.instance = new PostProcessManager()
    }
    return PostProcessManager.instance
  }

  enableEffect(effectType) {
    if (this.effects[effectType]) {
      this.effects[effectType].enabled = true
    }
  }

  disableEffect(effectType) {
    if (this.effects[effectType]) {
      this.effects[effectType].enabled = false
    }
  }

  isEffectEnabled(effectType) {
    return this.effects[effectType]?.enabled || false
  }

  getActiveEffects() {
    return Object.values(this.effects)
      .filter((effect) => effect.enabled)
      .sort((a, b) => a.priority - b.priority)
  }
}
export default PostProcessManager
