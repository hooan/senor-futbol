import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Chip from '@/components/ui/Chip'
import Modal from '@/components/ui/Modal'
import Loading, { Skeleton } from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'

export default function UIPreview() {
  const [modalOpen, setModalOpen] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [activeChip, setActiveChip] = useState('all')

  return (
    <div className="min-h-screen bg-raw-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b-heavy border-raw-black pb-8">
          <h1 className="font-headline text-6xl uppercase mb-4">UI COMPONENTS</h1>
          <p className="font-body text-lg">RawBlock Design System - Brutalist UI Components</p>
        </div>

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            BUTTONS
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="small">Small</Button>
              <Button variant="primary" size="medium">Medium</Button>
              <Button variant="primary" size="large">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" disabled>Disabled Primary</Button>
              <Button variant="secondary" disabled>Disabled Secondary</Button>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            CARDS
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="default">
              <h3 className="font-headline text-xl mb-3 uppercase">Default Card</h3>
              <p className="font-body">
                This is a default card with 3px borders. Perfect for standard content blocks.
              </p>
            </Card>
            
            <Card variant="elevated">
              <h3 className="font-headline text-xl mb-3 uppercase">Elevated Card</h3>
              <p className="font-body">
                This is an elevated card with 5px borders. Use for important or featured content.
              </p>
            </Card>
          </div>
        </section>

        {/* Form Elements */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            FORM ELEMENTS
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                placeholder="your@email.com" 
                helperText="We'll never share your email"
              />
              
              <Input 
                label="Password" 
                type="password" 
                placeholder="Enter password"
              />
              
              <Input 
                label="Error Example" 
                placeholder="Invalid input" 
                error="This field is required"
              />
              
              <Input 
                label="Disabled Input" 
                placeholder="Disabled" 
                disabled
              />
            </div>
            
            <div>
              <Textarea 
                label="Message" 
                placeholder="Enter your message here..."
                helperText="Maximum 500 characters"
              />
            </div>
          </div>
        </section>

        {/* Checkboxes & Radios */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            CHECKBOXES & RADIOS
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-body font-semibold uppercase text-sm mb-3">Checkboxes</h3>
              <Checkbox 
                label="I agree to the terms and conditions" 
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
              <Checkbox label="Send me email updates" />
              <Checkbox label="Disabled option" disabled />
            </div>
            
            <div className="space-y-3">
              <h3 className="font-body font-semibold uppercase text-sm mb-3">Radio Buttons</h3>
              <Radio 
                label="Option 1" 
                name="options"
                value="option1"
                checked={radioValue === 'option1'}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <Radio 
                label="Option 2" 
                name="options"
                value="option2"
                checked={radioValue === 'option2'}
                onChange={(e) => setRadioValue(e.target.value)}
              />
              <Radio 
                label="Disabled option" 
                name="options"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Chips */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            CHIPS
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-body font-semibold uppercase text-sm mb-3">Filter Chips</h3>
              <div className="flex flex-wrap gap-2">
                <Chip 
                  variant="filter" 
                  active={activeChip === 'all'}
                  onClick={() => setActiveChip('all')}
                >
                  All
                </Chip>
                <Chip 
                  variant="filter"
                  active={activeChip === 'news'}
                  onClick={() => setActiveChip('news')}
                >
                  News
                </Chip>
                <Chip 
                  variant="filter"
                  active={activeChip === 'fixtures'}
                  onClick={() => setActiveChip('fixtures')}
                >
                  Fixtures
                </Chip>
                <Chip 
                  variant="filter"
                  active={activeChip === 'quinielas'}
                  onClick={() => setActiveChip('quinielas')}
                >
                  Quinielas
                </Chip>
              </div>
            </div>
            
            <div>
              <h3 className="font-body font-semibold uppercase text-sm mb-3">Status Chips</h3>
              <div className="flex flex-wrap gap-2">
                <Chip variant="status" status="active">Active</Chip>
                <Chip variant="status" status="warning">Warning</Chip>
                <Chip variant="status" status="error">Error</Chip>
                <Chip variant="status" status="default">Default</Chip>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            BADGES
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </section>

        {/* Modal */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            MODAL
          </h2>
          
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            size="medium"
          >
            <div className="space-y-4">
              <p className="font-body">
                This is a brutalist modal dialog. It features thick borders and no rounded corners,
                staying true to the RawBlock design system.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            LOADING STATES
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <Loading size="small" text="Loading..." />
            </Card>
            <Card>
              <Loading size="medium" text="Loading..." />
            </Card>
            <Card>
              <Loading size="large" text="Loading..." />
            </Card>
          </div>
          
          <div>
            <h3 className="font-body font-semibold uppercase text-sm mb-3">Skeleton Loaders</h3>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            TYPOGRAPHY
          </h2>
          
          <div className="space-y-4">
            <div>
              <h1 className="font-headline text-h1">Headline 1 - 64px</h1>
              <p className="font-mono text-xs text-gray-600">Archivo Black, 64px, 1.0 line height</p>
            </div>
            <div>
              <h2 className="font-headline text-h2">Headline 2 - 48px</h2>
              <p className="font-mono text-xs text-gray-600">Archivo Black, 48px, 1.05 line height</p>
            </div>
            <div>
              <h3 className="font-headline text-h3">Headline 3 - 32px</h3>
              <p className="font-mono text-xs text-gray-600">Archivo Black, 32px, 1.1 line height</p>
            </div>
            <div>
              <h4 className="font-body text-h4">Headline 4 - 22px</h4>
              <p className="font-mono text-xs text-gray-600">Work Sans Semibold, 22px, 1.2 line height</p>
            </div>
            <div>
              <p className="font-body text-body">
                Body text - 16px. Work Sans Regular, 16px, 1.6 line height. Lorem ipsum dolor sit amet, 
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div>
              <p className="font-mono text-mono">Monospace - Space Mono 15px for code and data</p>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-6">
          <h2 className="font-headline text-3xl uppercase border-b-thick border-raw-black pb-3">
            COLORS
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-thick border-raw-black">
              <div className="bg-raw-black h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">Black</p>
                <p className="font-mono text-tiny text-gray-600">#000000</p>
              </div>
            </div>
            <div className="border-thick border-raw-black">
              <div className="bg-raw-white h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">White</p>
                <p className="font-mono text-tiny text-gray-600">#FFFFFF</p>
              </div>
            </div>
            <div className="border-thick border-raw-black">
              <div className="bg-raw-blue h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">Blue</p>
                <p className="font-mono text-tiny text-gray-600">#0000FF</p>
              </div>
            </div>
            <div className="border-thick border-raw-black">
              <div className="bg-raw-green h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">Green</p>
                <p className="font-mono text-tiny text-gray-600">#008000</p>
              </div>
            </div>
            <div className="border-thick border-raw-black">
              <div className="bg-raw-orange h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">Orange</p>
                <p className="font-mono text-tiny text-gray-600">#FFA500</p>
              </div>
            </div>
            <div className="border-thick border-raw-black">
              <div className="bg-raw-red h-24"></div>
              <div className="p-3">
                <p className="font-mono text-xs">Red</p>
                <p className="font-mono text-tiny text-gray-600">#FF0000</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
