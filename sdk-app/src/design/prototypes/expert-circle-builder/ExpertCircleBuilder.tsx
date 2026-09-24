import { useState, useMemo, useEffect } from 'react'
import type { Tier, Category, Expert, CartItem, SPOC } from './types'
import {
  EXPERTS,
  PRE_BUILT_BUNDLES,
  CATEGORY_LABELS,
  EXPERT_TYPE_LABELS,
  TIER_DESCRIPTIONS,
  PREMIUM_SPOC,
  getSeasonalRecommendation,
} from './expertCircleMockData'
import styles from './ExpertCircleBuilder.module.scss'

type Screen = 'builder' | 'checkout' | 'confirmation'

export function ExpertCircleBuilder() {
  // In a real app, tier would come from user's actual subscription
  // This dropdown is only for demo purposes to show different tier experiences
  const [demoTier, setDemoTier] = useState<Tier>('simple')
  const tier = demoTier // Use demo tier for this prototype

  // Premium tier SPOC (for demo, we show it when Premium is selected)
  const spoc: SPOC | null = tier === 'premium' ? PREMIUM_SPOC : null

  // Premium tier recommended advisors (static, not seasonal)
  const premiumRecommendedAdvisors = useMemo(() => {
    if (tier !== 'premium') return []
    return [
      EXPERTS.find(e => e.id === 'gusto-benefits'),
      EXPERTS.find(e => e.id === 'expert-accountant-bookkeeper'),
    ].filter(Boolean) as Expert[]
  }, [tier])

  const [cart, setCart] = useState<CartItem[]>([])
  const [savedAdvisors, setSavedAdvisors] = useState<CartItem[]>([])
  const [dismissedExpertIds, setDismissedExpertIds] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<Category>('bookkeeping')
  const [screen, setScreen] = useState<Screen>('builder')
  const [showTierDropdown, setShowTierDropdown] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [showCallScheduler, setShowCallScheduler] = useState<string | null>(null)
  const [showGusChat, setShowGusChat] = useState(false)
  const [gusMessages, setGusMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content:
        "Let's build your team of advisors! Tell me what you are looking for and I'll give you the options.",
    },
  ])
  const [selectedAdvisorChat, setSelectedAdvisorChat] = useState<string | null>(null)
  const [advisorMessages, setAdvisorMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const selectedAdvisor = selectedAdvisorChat
    ? EXPERTS.find(e => e.id === selectedAdvisorChat)
    : null

  // Get experts available or available-for-purchase in current tier
  const allExperts = useMemo(() => {
    return EXPERTS.filter(e => !dismissedExpertIds.has(e.id))
  }, [dismissedExpertIds])

  // For each tier, show which experts they can access
  const tierExperts = useMemo(() => {
    if (tier === 'simple') {
      // Simple gets: Tax Advisor (free), Benefits Advisor (free), + AI Agents (Workforce & Recruitment only) + Expert Marketplace + HRX (disabled)
      return allExperts.filter(e =>
        [
          'gusto-tax',
          'gusto-benefits',
          'ai-workforce-strategy',
          'ai-recruitment',
          'gusto-hrx',
          'expert-accountant-bookkeeper',
          'expert-tax-consultant-cpa',
          'expert-employment-attorney',
          'expert-financial-advisor',
        ].includes(e.id),
      )
    } else if (tier === 'plus') {
      // Plus gets: Tax Advisor (free), Benefits Advisor (free), HRX (add-on $99/mo), Workforce Strategy, + Expert Marketplace + AI Agents
      return allExperts.filter(e =>
        [
          'gusto-tax',
          'gusto-benefits',
          'gusto-hrx',
          'ai-workforce-strategy',
          'ai-recruitment',
          'expert-accountant-bookkeeper',
          'expert-tax-consultant-cpa',
          'expert-employment-attorney',
          'expert-financial-advisor',
        ].includes(e.id),
      )
    } else {
      // Premium gets: All three (tax and benefits free, HRX included)
      return allExperts
    }
  }, [tier, allExperts])

  // Get experts in cart by category for breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    cart.forEach(item => {
      breakdown[item.category] = (breakdown[item.category] || 0) + 1
    })
    return breakdown
  }, [cart])

  const totalMonthlyFee = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.monthlyFee, 0)
  }, [cart])

  const savedTotalMonthlyFee = useMemo(() => {
    return savedAdvisors.reduce((sum, item) => sum + item.monthlyFee, 0)
  }, [savedAdvisors])

  // Get pre-built bundles for current tier
  const availableBundles = useMemo(() => {
    return PRE_BUILT_BUNDLES.filter(b => b.availableInTiers.includes(tier))
  }, [tier])

  const handleAddToCart = (expert: Expert) => {
    setCart([...cart, { ...expert, addedAt: Date.now() }])
  }

  const handleRemoveFromCart = (expertId: string, addedAt: number) => {
    setCart(cart.filter(item => !(item.id === expertId && item.addedAt === addedAt)))
  }

  const handleDismissCard = (expertId: string) => {
    setDismissedExpertIds(new Set([...dismissedExpertIds, expertId]))
  }

  const handleAddBundle = (bundleId: string) => {
    const bundle = PRE_BUILT_BUNDLES.find(b => b.id === bundleId)
    if (bundle) {
      const newItems = bundle.experts
        .filter(e => !cart.some(c => c.id === e.id))
        .map(e => ({ ...e, addedAt: Date.now() }))
      setCart([...cart, ...newItems])
    }
  }

  const handleRemoveBundle = (bundleId: string) => {
    const bundle = PRE_BUILT_BUNDLES.find(b => b.id === bundleId)
    if (bundle) {
      const bundleExpertIds = new Set(bundle.experts.map(e => e.id))
      setSavedAdvisors(savedAdvisors.filter(a => !bundleExpertIds.has(a.id)))
    }
  }

  const isBundleFullySaved = (bundleId: string) => {
    const bundle = PRE_BUILT_BUNDLES.find(b => b.id === bundleId)
    if (!bundle) return false
    return bundle.experts.every(e => savedAdvisors.some(s => s.id === e.id))
  }

  // Recompute with updated state
  const currentTierExperts = useMemo(() => {
    if (tier === 'simple') {
      return allExperts.filter(e =>
        ['gusto-tax', 'gusto-benefits', 'ai-recruitment'].includes(e.id),
      )
    } else if (tier === 'plus') {
      return allExperts.filter(e =>
        [
          'gusto-tax',
          'gusto-benefits',
          'gusto-hrx',
          'ai-workforce-strategy',
          'ai-recruitment',
          'expert-accountant-bookkeeper',
          'expert-tax-consultant-cpa',
          'expert-employment-attorney',
          'expert-financial-advisor',
        ].includes(e.id),
      )
    } else {
      return allExperts
    }
  }, [tier, allExperts])

  // Get disabled advisors for Simple tier (shown in "Other" section)
  const disabledAdvisorsOnSimple = useMemo(() => {
    if (tier !== 'simple') return []
    return allExperts.filter(e =>
      [
        'ai-workforce-strategy',
        'gusto-hrx',
        'expert-accountant-bookkeeper',
        'expert-tax-consultant-cpa',
        'expert-employment-attorney',
        'expert-financial-advisor',
      ].includes(e.id),
    )
  }, [tier, allExperts])

  const handleClearCart = () => {
    setCart([])
    setDismissedExpertIds(new Set())
  }

  if (screen === 'checkout') {
    return (
      <CheckoutScreen
        tier={tier}
        cart={cart}
        totalMonthlyFee={totalMonthlyFee}
        onCheckoutComplete={() => {
          setSavedAdvisors([...cart])
          setCart([])
          setCheckoutComplete(true)
          setScreen('confirmation')
        }}
        onBack={() => {
          setScreen('builder')
        }}
      />
    )
  }

  if (screen === 'confirmation') {
    return (
      <ConfirmationScreen
        tier={tier}
        cart={savedAdvisors}
        totalMonthlyFee={savedTotalMonthlyFee}
        onDone={() => {
          setScreen('builder')
          setCheckoutComplete(true)
        }}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Gusto App Navigation Context */}
      <div className={styles.appNav}>
        <div className={styles.breadcrumb}>
          <span className={styles.navItem}>Help</span>
          <span className={styles.separator}>/</span>
          <span className={`${styles.navItem} ${styles.active}`}>Advisors</span>
        </div>

        {/* Tier Demo Selector (top right) */}
        <div className={styles.tierDropdownWrapper}>
          <button
            className={styles.tierDropdownButton}
            onClick={() => {
              setShowTierDropdown(!showTierDropdown)
            }}
            title="For demo purposes only - see experience for different tiers"
          >
            Plan: {`${tier.charAt(0).toUpperCase()}${tier.slice(1)}`}
          </button>
          {showTierDropdown && (
            <div className={styles.tierDropdown}>
              {(['simple', 'plus', 'premium'] as Tier[]).map(t => (
                <button
                  key={t}
                  className={`${styles.dropdownItem} ${tier === t ? styles.active : ''}`}
                  onClick={() => {
                    setDemoTier(t)
                    setCart([])
                    setDismissedExpertIds(new Set())
                    setShowTierDropdown(false)
                  }}
                >
                  <span
                    className={styles.tierLabel}
                  >{`${t.charAt(0).toUpperCase()}${t.slice(1)}`}</span>
                  <span className={styles.tierSmall}>{TIER_DESCRIPTIONS[t]}</span>
                </button>
              ))}
              <div className={styles.dropdownNote}>
                Demo: Switch tiers to see different expert availability
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          {/* Premium Plan WIP Note */}
          {tier === 'premium' && (
            <div className={styles.wipNote}>
              <p>The experience for the Premium tier is WIP and not reflective of proposed state</p>
            </div>
          )}

          {/* Compact Banner */}
          <div className={styles.banner}>
            <div>
              <h2>Expert Guidance, Built Into Your Plan</h2>
              <p>
                Tax and benefits are already included in your plan. When you&apos;re ready for more
                hands-on help, on demand specialized advisory services scale with you.
              </p>
            </div>
          </div>

          {/* Gus CTA Section - Show above Bundle on Plus only */}
          {tier === 'plus' && (
            <div className={styles.gusCTASection}>
              <button
                className={styles.gusCTAButton}
                onClick={() => {
                  setShowGusChat(true)
                }}
              >
                <span className={styles.gusCTAIcon}>✨</span>
                <div className={styles.gusCTAContent}>
                  <div className={styles.gusCTATitle}>Build my team with Gus</div>
                  <div className={styles.gusCTADesc}>Let AI help you find the right advisors</div>
                </div>
              </button>
            </div>
          )}

          {/* Pre-built Bundles Section - Only on Plus tier */}
          {availableBundles.length > 0 && tier === 'plus' && (
            <div className={styles.bundlesSection}>
              <h2>Recommended for you</h2>
              <p className={styles.bundleNote}>
                *Note: These will be event-based recommendations. For example, adding employees is a
                good trigger to prompt a meeting with a benefits advisor.
              </p>
              <div className={styles.bundleGrid}>
                {availableBundles.map(bundle => (
                  <div key={bundle.id} className={styles.bundleCard}>
                    <div className={styles.bundleHeader}>
                      <p className={styles.bundleDesc}>{bundle.description}</p>
                    </div>
                    <div className={styles.bundleExperts}>
                      {bundle.experts.map(e => (
                        <div key={e.id} className={styles.expertBadge}>
                          <div className={styles.expertBadgeName}>{e.name}</div>
                          <div className={styles.expertBadgeTitle}>{e.title}</div>
                          {e.id === 'gusto-hrx' && (
                            <div className={styles.expertBadgePrice}>
                              $99 per employee per month
                            </div>
                          )}
                          {e.id === 'expert-accountant-bookkeeper' && (
                            <div className={styles.expertBadgePrice}>$75 per hour</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className={styles.bundleFooter}>
                      <div className={styles.bundlePrice}>
                        {bundle.customPriceLabel || `$${bundle.totalMonthlyFee}/mo`}
                      </div>
                      {isBundleFullySaved(bundle.id) ? (
                        <button
                          className={styles.removeButton}
                          onClick={() => {
                            handleRemoveBundle(bundle.id)
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          className={styles.primaryButton}
                          onClick={() => {
                            handleAddBundle(bundle.id)
                          }}
                        >
                          Add All
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gus CTA Section - Show above Available Advisors on Simple/Premium */}
          {tier !== 'plus' && (
            <div className={styles.gusCTASection}>
              <button
                className={styles.gusCTAButton}
                onClick={() => {
                  setShowGusChat(true)
                }}
              >
                <span className={styles.gusCTAIcon}>✨</span>
                <div className={styles.gusCTAContent}>
                  <div className={styles.gusCTATitle}>Build my team with Gus</div>
                  <div className={styles.gusCTADesc}>Let AI help you find the right advisors</div>
                </div>
              </button>
            </div>
          )}

          {/* Recommended for Premium Tier */}
          {tier === 'premium' && premiumRecommendedAdvisors.length > 0 && (
            <div className={styles.bundlesSection}>
              <h2>Recommended for You Right Now</h2>
              <p className={styles.bundleNote}>
                Build your support team with these essential advisors, coordinated by your account
                partner if needed.
              </p>
              <div className={styles.bundleGrid}>
                <div className={styles.bundleCard}>
                  <div className={styles.bundleExperts}>
                    {premiumRecommendedAdvisors.map(advisor => (
                      <div key={advisor.id} className={styles.expertBadge}>
                        <div className={styles.expertBadgeName}>{advisor.name}</div>
                        <div className={styles.expertBadgeTitle}>{advisor.title}</div>
                        {advisor.monthlyFee === 0 && (
                          <div className={styles.expertBadgePrice}>Included</div>
                        )}
                        {advisor.hourlyRate && (
                          <div className={styles.expertBadgePrice}>${advisor.hourlyRate}/hour</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.bundleFooter}>
                    <div className={styles.bundlePrice}>Free + hourly</div>
                    {premiumRecommendedAdvisors.every(advisor =>
                      cart.some(c => c.id === advisor.id),
                    ) ? (
                      <button
                        className={styles.removeButton}
                        onClick={() => {
                          premiumRecommendedAdvisors.forEach(advisor => {
                            setCart(cart.filter(c => c.id !== advisor.id))
                          })
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        className={styles.primaryButton}
                        onClick={() => {
                          premiumRecommendedAdvisors.forEach(advisor => {
                            if (!cart.some(c => c.id === advisor.id)) {
                              handleAddToCart(advisor)
                            }
                          })
                        }}
                      >
                        Add Both
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expert Advisors Grid */}
          <div className={styles.advisorsSection}>
            <h3 className={styles.sectionTitle}>Available Advisors</h3>
            {tier === 'simple' && (
              <p className={styles.simplePlanNote}>
                Your plan includes free access to these advisors and they are already part of your
                team, reach out when you need them.
              </p>
            )}
            <div className={styles.cardsContainer}>
              {currentTierExperts.map(expert => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  tier={tier}
                  isInCart={cart.some(c => c.id === expert.id)}
                  isInSavedAdvisors={savedAdvisors.some(c => c.id === expert.id)}
                  checkoutComplete={checkoutComplete}
                  onAdd={() => {
                    handleAddToCart(expert)
                  }}
                  onRemove={() => {
                    setCart(cart.filter(c => c.id !== expert.id))
                  }}
                  onRemoveFromSaved={() => {
                    setSavedAdvisors(savedAdvisors.filter(a => a.id !== expert.id))
                  }}
                  onDismiss={() => {
                    handleDismissCard(expert.id)
                  }}
                  onScheduleCall={expertId => {
                    setShowCallScheduler(expertId)
                  }}
                  onChatClick={expertId => {
                    setSelectedAdvisorChat(expertId)
                    setAdvisorMessages([
                      {
                        role: 'assistant',
                        content: `Hi! I'm ${EXPERTS.find(e => e.id === expertId)?.name}. How can I help you today?`,
                      },
                    ])
                  }}
                />
              ))}
            </div>
          </div>

          {/* Other section - only on Simple tier */}
          {tier === 'simple' && disabledAdvisorsOnSimple.length > 0 && (
            <div className={styles.advisorsSection}>
              <h3 className={styles.sectionTitle}>Other</h3>
              <div className={styles.cardsContainer}>
                {disabledAdvisorsOnSimple.map(expert => (
                  <ExpertCard
                    key={expert.id}
                    expert={expert}
                    tier={tier}
                    isInCart={cart.some(c => c.id === expert.id)}
                    isInSavedAdvisors={savedAdvisors.some(c => c.id === expert.id)}
                    checkoutComplete={checkoutComplete}
                    onAdd={() => {
                      handleAddToCart(expert)
                    }}
                    onRemove={() => {
                      setCart(cart.filter(c => c.id !== expert.id))
                    }}
                    onRemoveFromSaved={() => {
                      setSavedAdvisors(savedAdvisors.filter(a => a.id !== expert.id))
                    }}
                    onDismiss={() => {
                      handleDismissCard(expert.id)
                    }}
                    onScheduleCall={expertId => {
                      setShowCallScheduler(expertId)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Premium SPOC + Chat, or Chat/Cart */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            {/* Premium Tier SPOC Card */}
            {tier === 'premium' && (
              <div className={styles.spocCard}>
                <h3>Your Premium Partner</h3>
                {spoc ? (
                  <>
                    <div className={styles.spocInfo}>
                      <div className={styles.spocName}>{spoc.name}</div>
                      <div className={styles.spocTitle}>{spoc.title}</div>
                    </div>
                    <div className={styles.spocActions}>
                      <button
                        className={styles.spocButton}
                        onClick={() => {
                          // Chat with SPOC
                        }}
                      >
                        Chat
                      </button>
                      <button
                        className={styles.spocButton}
                        onClick={() => {
                          // Email SPOC
                        }}
                      >
                        Email
                      </button>
                      <button
                        className={styles.spocButton}
                        onClick={() => {
                          // Schedule call with SPOC
                        }}
                      >
                        Schedule
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.spocPlaceholder}>
                    Your Premium Account Partner has not yet been assigned
                  </div>
                )}
              </div>
            )}

            {/* Chat Area - takes remaining space on Premium, full space on other tiers */}
            {showGusChat ? (
              <>
                <div className={styles.chatHeader}>
                  <h2>Chat with Gus</h2>
                  <button
                    className={styles.closeChat}
                    onClick={() => {
                      setShowGusChat(false)
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.chatMessages}>
                  {gusMessages.map((msg, idx) => (
                    <div key={idx} className={`${styles.chatMessage} ${styles[msg.role]}`}>
                      <div className={styles.chatMessageContent}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.chatInput}>
                  <input
                    type="text"
                    placeholder="Tell me what you're looking for..."
                    onKeyPress={e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setGusMessages([
                          ...gusMessages,
                          { role: 'user', content: e.currentTarget.value },
                        ])
                        e.currentTarget.value = ''
                        // Simulate Gus response
                        setTimeout(() => {
                          setGusMessages(prev => [
                            ...prev,
                            {
                              role: 'assistant',
                              content: 'Based on what you shared, here are some recommendations...',
                            },
                          ])
                        }, 500)
                      }
                    }}
                  />
                </div>
              </>
            ) : selectedAdvisorChat && selectedAdvisor ? (
              <>
                <div className={styles.chatHeader}>
                  <h2>Chat with {selectedAdvisor.name}</h2>
                  <button
                    className={styles.closeChat}
                    onClick={() => {
                      setSelectedAdvisorChat(null)
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.chatMessages}>
                  {advisorMessages.map((msg, idx) => (
                    <div key={idx} className={`${styles.chatMessage} ${styles[msg.role]}`}>
                      <div className={styles.chatMessageContent}>{msg.content}</div>
                    </div>
                  ))}
                </div>
                <div className={styles.chatInput}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedAdvisor.name}...`}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setAdvisorMessages([
                          ...advisorMessages,
                          { role: 'user', content: e.currentTarget.value },
                        ])
                        e.currentTarget.value = ''
                        // Simulate advisor response
                        setTimeout(() => {
                          const responses = [
                            "Thanks for reaching out! I'm here to help.",
                            "That's a great question. Let me help you with that.",
                            "I understand. Here's what I recommend...",
                            'Feel free to reach out anytime you need assistance!',
                          ]
                          const randomResponse =
                            responses[Math.floor(Math.random() * responses.length)]
                          setAdvisorMessages(prev => [
                            ...prev,
                            { role: 'assistant', content: randomResponse },
                          ])
                        }, 500)
                      }
                    }}
                  />
                </div>
              </>
            ) : tier === 'plus' || tier === 'premium' ? (
              <>
                <h2>Your Advisors</h2>

                {savedAdvisors.length === 0 && cart.length === 0 ? (
                  <div className={styles.emptyCart}>
                    <p>Add advisors to build your team</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.cartItems}>
                      {/* Show saved advisors first */}
                      {savedAdvisors.map(item => (
                        <div key={`${item.id}-saved`} className={styles.cartItem}>
                          <div className={styles.cartItemInfo}>
                            <div className={styles.cartItemName}>{item.name}</div>
                            <div className={styles.cartItemBio}>{item.bio}</div>
                            <div className={styles.cartItemPrice}>
                              {item.monthlyFee === 0 ? 'Included' : `$${item.monthlyFee}/mo`}
                            </div>
                            <div className={styles.savedAdvisorStatus}>
                              <span className={styles.statusBadge}>Active</span>
                              <button
                                className={styles.actionButton}
                                onClick={() => {
                                  // Contact SPOC
                                }}
                              >
                                {item.type === 'ai_agent' ? 'Chat now' : 'Send email'}
                              </button>
                            </div>
                          </div>
                          <button
                            className={styles.removeButtonSmall}
                            onClick={() => {
                              setSavedAdvisors(savedAdvisors.filter(a => a.id !== item.id))
                            }}
                            title="Remove from circle"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {/* Show unsaved (cart) items */}
                      {cart.map(item => (
                        <div key={`${item.id}-${item.addedAt}`} className={styles.cartItem}>
                          <div className={styles.cartItemInfo}>
                            <div className={styles.cartItemName}>{item.name}</div>
                            <div className={styles.cartItemBio}>{item.bio}</div>
                            <div className={styles.cartItemPrice}>
                              {item.monthlyFee === 0 ? 'Included' : `$${item.monthlyFee}/mo`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cart.length > 0 && (
                      <button
                        className={styles.primaryButton}
                        onClick={() => {
                          setScreen('checkout')
                        }}
                      >
                        Save
                      </button>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Modals rendered as overlays */}
      {showCallScheduler && (
        <CallSchedulerModal
          expert={EXPERTS.find(e => e.id === showCallScheduler)!}
          onClose={() => {
            setShowCallScheduler(null)
          }}
        />
      )}
    </div>
  )
}

interface ExpertCardProps {
  expert: Expert
  tier: Tier
  isInCart: boolean
  isInSavedAdvisors: boolean
  checkoutComplete: boolean
  onAdd: () => void
  onRemove: () => void
  onRemoveFromSaved: () => void
  onDismiss: () => void
  onScheduleCall: (expertId: string) => void
  onChatClick: (expertId: string) => void
}

function ExpertCard({
  expert,
  tier,
  isInCart,
  isInSavedAdvisors,
  checkoutComplete,
  onAdd,
  onRemove,
  onRemoveFromSaved,
  onDismiss,
  onScheduleCall,
  onChatClick,
}: ExpertCardProps) {
  const isLocked = !expert.availableInTiers.includes(tier)
  // For Gusto Benefits on Simple tier, show as AI Agent
  const displayType = tier === 'simple' && expert.id === 'gusto-benefits' ? 'ai_agent' : expert.type
  const typeLabel = EXPERT_TYPE_LABELS[displayType]
  const isPaid = expert.monthlyFee > 0
  const isExternalMarketplaceAdvisor = expert.type === 'external_expert'
  const isIncludedAdvisor = expert.id === 'gusto-tax' || expert.id === 'gusto-benefits'
  const isDisabledOnSimple =
    tier === 'simple' && (expert.id === 'ai-workforce-strategy' || expert.id === 'gusto-hrx')
  const isExternalDisabledOnSimple = tier === 'simple' && isExternalMarketplaceAdvisor

  return (
    <div className={styles.expertCard} data-locked={isLocked}>
      <div className={styles.expertCardContent}>
        <div className={styles.expertHeader}>
          <h3>{expert.name}</h3>
          <div className={styles.headerTags}>
            <div className={styles.typeTag}>
              <span className={styles.typeIcon}>{typeLabel.icon}</span>
              <span>{typeLabel.label}</span>
            </div>
            {expert.id === 'gusto-tax' && tier === 'simple' && (
              <div className={styles.recommendedTag}>Recommended</div>
            )}
          </div>
        </div>

        <p className={styles.title}>{expert.title}</p>
        <p className={styles.bio}>{expert.bio}</p>

        {isLocked && expert.id !== 'ai-wage-advisor' ? (
          <>
            <div className={styles.lockedOverlay}>
              <div className={styles.lockMessage}>
                🔒 Not available on {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
              <p>Upgrade your plan to access</p>
            </div>
          </>
        ) : (
          <>
            <div className={styles.priceSection}>
              {expert.id === 'ai-wage-advisor' ? (
                <div style={{ height: '0' }}></div>
              ) : isDisabledOnSimple || isExternalDisabledOnSimple ? (
                <div className={styles.includedPrice}>Available on Plus and Premium</div>
              ) : tier !== 'simple' && expert.priceDisplayLabel ? (
                <div className={styles.price}>{expert.priceDisplayLabel}</div>
              ) : expert.hourlyRate ? (
                <div className={styles.price}>${expert.hourlyRate}/hour</div>
              ) : expert.monthlyFee === 0 ? (
                <div className={styles.includedPrice}>Included with your plan</div>
              ) : (
                <div className={styles.price}>+ ${expert.monthlyFee}/mo</div>
              )}
            </div>

            {/* Saved advisors: Show remove button */}
            {isInSavedAdvisors ? (
              <button className={styles.removeButton} onClick={onRemoveFromSaved}>
                Remove
              </button>
            ) : /* Post-checkout state: Show remove button */
            checkoutComplete && isInCart ? (
              <button className={styles.removeButton} onClick={onRemove}>
                Remove
              </button>
            ) : /* Disabled on Simple tier: Show disabled light green button */
            isDisabledOnSimple ? (
              <button className={`${styles.addButton} ${styles.disabledGreen}`} disabled>
                + Add
              </button>
            ) : /* External marketplace advisors disabled on Simple: Show disabled light green button */
            isExternalDisabledOnSimple ? (
              <button className={`${styles.addButton} ${styles.disabledGreen}`} disabled>
                + Add
              </button>
            ) : /* Free advisors with no schedule option: Show Chat button */
            expert.monthlyFee === 0 && !expert.scheduleFreeConsultation ? (
              <button
                className={styles.addButton}
                onClick={() => {
                  onChatClick(expert.id)
                }}
              >
                Chat with Advisor
              </button>
            ) : /* Offer free consultation: Show two buttons */
            expert.scheduleFreeConsultation && !isInCart ? (
              <div className={styles.buttonGroup}>
                <button
                  className={styles.secondarySmallButton}
                  onClick={() => {
                    onScheduleCall(expert.id)
                  }}
                >
                  Schedule free 30 min call
                </button>
                <button className={styles.addButton} onClick={onAdd}>
                  + Add
                </button>
              </div>
            ) : (
              /* Paid advisors or already added */
              <button
                className={`${styles.addButton} ${isInCart ? styles.added : ''} ${isLocked ? styles.disabled : ''}`}
                onClick={onAdd}
                disabled={isInCart || isLocked}
              >
                {isInCart ? '✓ Added' : '+ Add'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface CallSchedulerModalProps {
  expert: Expert
  onClose: () => void
}

function CallSchedulerModal({ expert, onClose }: CallSchedulerModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [confirmed, setConfirmed] = useState(false)

  if (confirmed) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Call Scheduled!</h2>
          <p>Your 30-minute consultation with {expert.name} has been scheduled.</p>
          <p>You&apos;ll receive a calendar invite at your email.</p>
          <button className={styles.primaryButton} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <h2>Schedule Your Free 30-Minute Call</h2>
        <p className={styles.modalSubtitle}>With {expert.name}</p>

        <div className={styles.timeSlots}>
          {['Tomorrow 2:00 PM', 'Tomorrow 3:30 PM', 'Thursday 10:00 AM', 'Thursday 2:00 PM'].map(
            time => (
              <button
                key={time}
                className={`${styles.timeSlot} ${selectedTime === time ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedTime(time)
                }}
              >
                {time}
              </button>
            ),
          )}
        </div>

        <button
          className={styles.primaryButton}
          disabled={!selectedTime}
          onClick={() => {
            setConfirmed(true)
          }}
        >
          Confirm Call
        </button>
      </div>
    </div>
  )
}

interface CheckoutScreenProps {
  tier: Tier
  cart: CartItem[]
  totalMonthlyFee: number
  onCheckoutComplete: () => void
  onBack: () => void
}

function CheckoutScreen({
  tier,
  cart,
  totalMonthlyFee,
  onCheckoutComplete,
  onBack,
}: CheckoutScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = () => {
    setIsProcessing(true)
    // Auto-process after 1.5 seconds to show completion
    setTimeout(() => {
      onCheckoutComplete()
    }, 1500)
  }

  // Auto-confirm checkout on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCheckout()
    }, 500) // Small delay so user sees the review screen
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={styles.checkoutScreen}>
      <button className={styles.backButton} onClick={onBack}>
        ← Back
      </button>

      <div className={styles.checkoutContent}>
        <h1>Review & Confirm</h1>

        <div className={styles.checkoutSections}>
          <section className={styles.checkoutSection}>
            <h2>Your Gusto Plan</h2>
            <div className={styles.planBadge}>
              {`${tier.charAt(0).toUpperCase()}${tier.slice(1)}`} Plan
            </div>
          </section>

          <section className={styles.checkoutSection}>
            <h2>Selected Experts ({cart.length})</h2>
            <div className={styles.checkoutList}>
              {cart.map((expert, idx) => (
                <div key={`${expert.id}-${expert.addedAt}`} className={styles.checkoutItem}>
                  <div className={styles.checkoutItemLeft}>
                    <div className={styles.checkoutItemName}>{expert.name}</div>
                    <div className={styles.checkoutItemType}>
                      {EXPERT_TYPE_LABELS[expert.type].icon} {EXPERT_TYPE_LABELS[expert.type].label}
                    </div>
                  </div>
                  <div className={styles.checkoutItemPrice}>
                    {expert.monthlyFee === 0 ? 'Included' : `$${expert.monthlyFee}/mo`}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.checkoutSection}>
            <h2>Monthly Recurring Charge</h2>
            <div className={styles.pricingSummary}>
              <div className={styles.pricingLine}>
                <span>Total Monthly Fee</span>
                <span className={styles.amount}>${totalMonthlyFee}</span>
              </div>
              <div className={styles.pricingNote}>
                This amount will be added to your Gusto invoice and charged monthly.
              </div>
            </div>
          </section>

          <section className={styles.checkoutSection}>
            <h2>Billing Details</h2>
            <div className={styles.billingInfo}>
              <div className={styles.infoRow}>
                <span>Billing Cycle</span>
                <strong>Monthly (recurring)</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Start Date</span>
                <strong>Next billing cycle</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Payment Method</span>
                <strong>Gusto Invoice</strong>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.checkoutActions}>
          <button className={styles.primaryButton} onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm & Checkout'}
          </button>
          <button className={styles.secondaryButton} onClick={onBack} disabled={isProcessing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

interface ConfirmationScreenProps {
  tier: Tier
  cart: CartItem[]
  totalMonthlyFee: number
  onDone: () => void
}

function ConfirmationScreen({ tier, cart, totalMonthlyFee, onDone }: ConfirmationScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.appNav}>
        <div className={styles.breadcrumb}>
          <span className={styles.navItem}>Help</span>
          <span className={styles.separator}>/</span>
          <span className={`${styles.navItem} ${styles.active}`}>Advisors</span>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.confirmationScreen}>
            <div className={styles.successMessage}>
              <div className={styles.checkmark}>✓</div>
              <h1>Your Advisors are Confirmed!</h1>
              <p>Your team of advisors is ready to support your business.</p>
              <p className={styles.successDetails}>
                A charge of <strong>${totalMonthlyFee}/month</strong> will be added to your Gusto
                invoice starting on your next billing date. You can manage or adjust your advisors
                anytime from Help &gt; Advisors.
              </p>
            </div>

            <div className={styles.circleSummary}>
              <h2>Your Advisors ({cart.length})</h2>
              <div className={styles.selectedExperts}>
                {cart.map(expert => (
                  <div key={`${expert.id}-${expert.addedAt}`} className={styles.selectedExpert}>
                    <div className={styles.expertIcon}>{EXPERT_TYPE_LABELS[expert.type].icon}</div>
                    <div className={styles.expertInfo}>
                      <div className={styles.expertName}>{expert.name}</div>
                      <small className={styles.expertTitle}>{expert.title}</small>
                    </div>
                    {expert.monthlyFee > 0 && (
                      <div className={styles.expertPrice}>${expert.monthlyFee}/mo</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.primaryButton} onClick={onDone}>
              Return to Help
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
