import { useEffect, useState } from 'react'
import { X, Mail, Phone, MapPin, Calendar, User } from 'lucide-react'

const RANK_COLORS = {
  SMD: { border: '#fbbf24', bg: '#451a03' },
  MD:  { border: '#d97706', bg: '#3b1f00' },
  A:   { border: '#a8a29e', bg: '#292524' },
  TA:  { border: '#57534e', bg: '#1c1917' },
}

const AVATAR_COLORS = [
  '#9f1239','#115e59','#3730a3','#9a3412',
  '#065f46','#5b21b6','#075985','#9d174d',
]

function getAvatarBg(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        color: '#525252', fontSize: 10, letterSpacing: '0.25em',
        textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 8,
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
      <Icon size={13} style={{ color: '#525252', marginTop: 2, flexShrink: 0 }} />
      <div>
        <span style={{ color: '#525252', fontSize: 10, fontFamily: 'monospace', marginRight: 8 }}>
          {label}
        </span>
        {href ? (
          <a href={href} style={{ color: '#fcd34d', fontSize: 13, textDecoration: 'none', wordBreak: 'break-all' }}>
            {value}
          </a>
        ) : (
          <span style={{ color: '#e5e5e5', fontSize: 13 }}>{value}</span>
        )}
      </div>
    </div>
  )
}

function Tag({ label, type }) {
  const licenseStyle = { background: 'rgba(120,53,15,0.3)', border: '1px solid #78350f', color: '#fcd34d' }
  const skillStyle   = { background: '#1f1f1f', border: '1px solid #404040', color: '#a3a3a3' }
  const s = type === 'license' ? licenseStyle : skillStyle
  return (
    <span style={{ ...s, fontSize: 11, padding: '3px 8px', borderRadius: 3, fontFamily: 'monospace' }}>
      {label}
    </span>
  )
}

export default function ProfileModal({ member, onClose }) {
  const isMobile = useIsMobile()
  const [visible, setVisible] = useState(false)

  if (!member) return null

  const colors   = RANK_COLORS[member.rank] || RANK_COLORS.TA
  const initials = member.nameEn?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'
  const avatarBg = getAvatarBg(member.nameEn || '')
  const hasPhoto = member.photoUrl && !member.photoUrl.includes('ui-avatars')

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Close on ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleClose = (e) => {
    e.stopPropagation()
    onClose()
  }

  // Mobile: full-screen bottom sheet
  const mobileModalStyle = {
    position:    'fixed',
    bottom:      0,
    left:        0,
    right:       0,
    height:      '92vh',
    background:  '#171717',
    border:      '1px solid #262626',
    borderRadius: '16px 16px 0 0',
    boxShadow:   '0 -8px 40px rgba(0,0,0,0.8)',
    zIndex:      201,
    overflowY:   'auto',
    transform:   visible ? 'translateY(0)' : 'translateY(100%)',
    transition:  'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  }

  // Desktop: centered modal
  const desktopModalStyle = {
    position:   'fixed',
    top:        '50%',
    left:       '50%',
    transform:  visible ? 'translate(-50%, -50%)' : 'translate(-50%, -48%)',
    opacity:    visible ? 1 : 0,
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    width:      '90vw',
    maxWidth:   460,
    maxHeight:  '90vh',
    overflowY:  'auto',
    background: '#171717',
    border:     '1px solid #262626',
    boxShadow:  '0 24px 64px rgba(0,0,0,0.8)',
    zIndex:     201,
  }

  const modalStyle = isMobile ? mobileModalStyle : desktopModalStyle

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position:       'fixed',
          inset:          0,
          background:     'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex:         200,
          opacity:        visible ? 1 : 0,
          transition:     'opacity 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: '#404040',
            }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        isMobile ? '8px 20px 12px' : '16px 20px',
          borderBottom:   '1px solid #262626',
          position:       'sticky',
          top:            0,
          background:     '#171717',
          zIndex:         1,
        }}>
          <span style={{
            background:    colors.border,
            color:         member.rank === 'MD' || member.rank === 'TA' ? 'white' : '#0a0a0a',
            fontSize:      11, fontWeight: 700, letterSpacing: '0.15em',
            padding:       '3px 10px', fontFamily: 'monospace',
          }}>
            {member.rank}
          </span>
          <button
            onClick={handleClose}
            onTouchEnd={handleClose}
            style={{
              background: 'none', border: 'none', color: '#525252',
              cursor: 'pointer', padding: '6px 8px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Avatar + Name */}
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          padding:       isMobile ? '20px 20px 16px' : '28px 20px 20px',
          borderBottom:  '1px solid #262626',
        }}>
          {hasPhoto ? (
            <img
              src={member.photoUrl}
              alt={member.nameEn}
              style={{
                width: 96, height: 96, borderRadius: '50%',
                objectFit: 'cover', border: '3px solid ' + colors.border,
                marginBottom: 16,
              }}
            />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: avatarBg, border: '3px solid ' + colors.border,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 32, fontWeight: 600,
              fontFamily: 'monospace', marginBottom: 16,
              boxShadow: '0 0 24px ' + colors.border + '40',
            }}>
              {initials}
            </div>
          )}

          <h2 style={{
            color: '#fef3c7', fontSize: isMobile ? 28 : 26,
            fontFamily: 'Georgia, serif', margin: 0, textAlign: 'center',
          }}>
            {member.nameZh}
          </h2>
          <p style={{ color: '#737373', fontSize: 13, fontFamily: 'monospace', margin: '6px 0 0' }}>
            {member.nameEn}
          </p>
          <p style={{
            color: '#525252', fontSize: 11, fontFamily: 'monospace',
            margin: '8px 0 0', letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            {member.city}, {member.state}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? '20px 20px 40px' : '20px' }}>

          <Section label="Contact">
            <InfoRow icon={Mail}  label="Email"    value={member.email}    href={'mailto:' + member.email} />
            <InfoRow icon={Phone} label="Phone"    value={member.phone}    href={'tel:' + member.phone} />
            <InfoRow icon={User}  label="Line"     value={member.lineId}   href={null} />
            <InfoRow icon={Phone} label="WhatsApp" value={member.whatsapp} href={member.whatsapp ? 'https://wa.me/' + member.whatsapp.replace(/\D/g, '') : null} />
            <InfoRow icon={User}  label="Facebook" value={member.facebook ? 'Profile' : null} href={member.facebook} />
          </Section>

          {member.licenses && member.licenses.length > 0 && (
            <Section label="Licenses">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {member.licenses.map(l => <Tag key={l} label={l} type="license" />)}
              </div>
            </Section>
          )}

          {member.skills && member.skills.length > 0 && (
            <Section label="Areas of Expertise">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {member.skills.map(s => <Tag key={s} label={s} type="skill" />)}
              </div>
            </Section>
          )}

          {member.intro && (
            <Section label="Bio">
              <p style={{ color: '#a3a3a3', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                {member.intro}
              </p>
            </Section>
          )}

          <Section label="Organization">
            <InfoRow icon={User}     label="Sponsor"  value={member.sponsorName} href={null} />
            <InfoRow icon={Calendar} label="Joined"   value={member.joinDate}    href={null} />
            <InfoRow icon={MapPin}   label="Location" value={member.city + ', ' + member.state} href={null} />
          </Section>

        </div>
      </div>
    </>
  )
}
