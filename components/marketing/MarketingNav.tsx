'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

/**
 * Top navigation bar for the public marketing site.
 * Cream bg, logo left, CTA right. Collapses to hamburger on mobile.
 */
export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      className="w-full bg-white border-b"
      style={{ borderColor: '#ddd6c8' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Innerframe Care Solutions"
            width={40}
            height={40}
            className="rounded object-contain"
          />
          <div>
            <div
              className="font-medium tracking-wide text-sm leading-tight"
              style={{ color: '#1E3A2F' }}
            >
              INNERFRAME
            </div>
            <div className="text-xs leading-tight" style={{ color: '#5a5a5a' }}>
              CARE SOLUTIONS
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#pillars"
            className="text-sm transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.color = '#1E3A2F')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.color = '#5a5a5a')
            }
          >
            What We Do
          </a>
          <a
            href="#how-it-works"
            className="text-sm transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.color = '#1E3A2F')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.color = '#5a5a5a')
            }
          >
            How It Works
          </a>
          <a
            href="#who-its-for"
            className="text-sm transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.color = '#1E3A2F')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.color = '#5a5a5a')
            }
          >
            Who It&apos;s For
          </a>
          <a
            href="#contact"
            className="text-sm transition-colors"
            style={{ color: '#5a5a5a' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.color = '#1E3A2F')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.color = '#5a5a5a')
            }
          >
            Contact
          </a>
        </div>

        {/* Client portal CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#1E3A2F' }}
            onMouseEnter={e =>
              ((e.target as HTMLElement).style.backgroundColor = '#2D5A3D')
            }
            onMouseLeave={e =>
              ((e.target as HTMLElement).style.backgroundColor = '#1E3A2F')
            }
          >
            Client Portal
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{ color: '#1E3A2F' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: '#ddd6c8', backgroundColor: '#ffffff' }}
        >
          <a href="#pillars" className="text-sm" style={{ color: '#1E3A2F' }}>
            What We Do
          </a>
          <a
            href="#how-it-works"
            className="text-sm"
            style={{ color: '#1E3A2F' }}
          >
            How It Works
          </a>
          <a
            href="#who-its-for"
            className="text-sm"
            style={{ color: '#1E3A2F' }}
          >
            Who It&apos;s For
          </a>
          <a href="#contact" className="text-sm" style={{ color: '#1E3A2F' }}>
            Contact
          </a>
          <Link
            href="/login"
            className="px-4 py-2 rounded text-sm font-medium text-white text-center"
            style={{ backgroundColor: '#1E3A2F' }}
          >
            Client Portal
          </Link>
        </div>
      )}
    </nav>
  )
}
