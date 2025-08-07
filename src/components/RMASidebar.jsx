import React, { useState, useEffect } from 'react';
import {
  Menu, Home, FileText, Search, Users, Folder, Plus,
  ChevronDown, ChevronRight, Layers
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RMASidebar.css';

const RMASidebar = ({ isCollapsed: externalIsCollapsed, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(externalIsCollapsed || false);
  const [activeItem, setActiveItem] = useState('');
  const [expandedMenus, setExpandedMenus] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof externalIsCollapsed === 'boolean') {
      setIsCollapsed(externalIsCollapsed);
    }
  }, [externalIsCollapsed]);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  const isMenuExpanded = (id) => expandedMenus.includes(id);

  const handleToggle = (id) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNavigate = (id, href) => {
    setActiveItem(id);
    if (href) navigate(href);
  };

  const menu = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      href: '/dashboard'
    },
    {
      id: 'e-floote',
      label: 'e-Floote',
      icon: FileText,
      href: '/e-floote'
    },
    {
      id: 'e-epargne',
      label: 'e-Epargne',
      icon: FileText,
      href: '/e-epargne'
    },
    {
      id: 'e-sante',
      label: 'e-Santé',
      icon: Users,
      isExpandable: true,
      subItems: [
        {
          id: 'mes-contrats',
          label: 'Mes Contrats',
          icon: FileText,
          href: '/sante/contrats'
        },
        {
          id: 'gestion-adhesion',
          label: 'Gestion Adhésion',
          icon: FileText,
          href: '/sante/adhesion'
        },
        {
          id: 'dossier-maladie',
          label: 'Dossier Maladie',
          icon: Folder,
          isExpandable: true,
          subItems: [
            {
              id: 'search-sinistre',
              label: 'Rechercher Sinistre',
              icon: Search,
              href: '/consultation/sinistres'
            },
            {
              id: 'creer-sinistre',
              label: 'Créer Sinistre',
              icon: Plus,
              href: '/consultation/sinistres/creer'
            },
            {
              id: 'search-lot',
              label: 'Rechercher Lot',
              icon: Search,
              href: '/lots'
            },
            {
              id: 'create-lot',
              label: 'Créer Lot',
              icon: FileText,
              href: '/lots/creation'
            }
          ]
        },
        {
          id: 'edition',
          label: 'Édition',
          icon: FileText,
          href: '/sante/edition'
        }
      ]
    },
    {
      id: 'e-at',
      label: 'e-AT',
      icon: FileText,
      href: '/e-at'
    },
    {
      id: 'e-iard',
      label: 'e-IARD',
      icon: FileText,
      href: '/e-iard'
    }
  ];

  const renderMenu = (items, depth = 0) => (
    <ul className={depth === 0 ? 'rma-sidebar-menu' : 'rma-sidebar-submenu'}>
      {items.map(item => {
        const Icon = item.icon;
        const expanded = isMenuExpanded(item.id);

        return (
          <li key={item.id} className={depth === 0 ? 'rma-sidebar-item' : 'rma-sidebar-subitem'}>
            <a
              href={item.href || '#'}
              className={`${depth === 0 ? 'rma-sidebar-link' : 'rma-sidebar-sublink'} ${activeItem === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                item.isExpandable
                  ? handleToggle(item.id)
                  : handleNavigate(item.id, item.href);
              }}
              title={isCollapsed ? item.label : ''}
            >
              {Icon && <Icon size={depth === 0 ? 20 : 16} />}
              {!isCollapsed && (
                <>
                  <span className={depth === 0 ? 'rma-sidebar-label' : 'rma-sidebar-sublabel'}>{item.label}</span>
                  {item.isExpandable && (
                    <div className="rma-sidebar-arrow">
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  )}
                </>
              )}
            </a>
            {item.subItems && expanded && !isCollapsed && renderMenu(item.subItems, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`rma-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="rma-sidebar-header">
        <button className="rma-sidebar-toggle" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
      </div>
      <nav className="rma-sidebar-nav">
        {renderMenu(menu)}
      </nav>
    </div>
  );
};

export default RMASidebar;
