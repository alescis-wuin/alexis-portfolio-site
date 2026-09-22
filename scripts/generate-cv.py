from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
base=Path(__file__).resolve().parents[1]
import argparse
parser=argparse.ArgumentParser(description='Regénérer le CV public avec ReportLab.')
parser.add_argument('--font-dir',type=Path,default=next((d for d in [Path('/usr/share/fonts/truetype/dejavu'),Path('/usr/share/fonts/TTF')] if (d/'DejaVuSans.ttf').exists()),Path('/usr/share/fonts/truetype/dejavu')))
font_dir=parser.parse_args().font_dir
for name,file in [('DejaVu','DejaVuSans.ttf'),('DejaVu-Bold','DejaVuSans-Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(font_dir/file)))
pdfmetrics.registerFontFamily('DejaVu',normal='DejaVu',bold='DejaVu-Bold',italic='DejaVu',boldItalic='DejaVu-Bold')
s={
'name':ParagraphStyle('name',fontName='DejaVu-Bold',fontSize=25,leading=30,textColor=colors.HexColor('#19291e'),spaceAfter=4),
'role':ParagraphStyle('role',fontName='DejaVu-Bold',fontSize=12,leading=17,spaceAfter=9),
'body':ParagraphStyle('body',fontName='DejaVu',fontSize=9,leading=13,spaceAfter=5,textColor=colors.HexColor('#29352e')),
'h2':ParagraphStyle('h2',fontName='DejaVu-Bold',fontSize=10,leading=14,spaceBefore=13,spaceAfter=6,textColor=colors.HexColor('#335d3e')),
'h3':ParagraphStyle('h3',fontName='DejaVu-Bold',fontSize=9,leading=13,spaceAfter=4),
'contact':ParagraphStyle('contact',fontName='DejaVu',fontSize=8.3,leading=12,spaceAfter=4),
}
items=[]
def p(text,style='body'): items.append(Paragraph(text,s[style]))
p('Alexis Guinot','name');p('Concepteur-développeur full-stack | Java / Spring · C# / .NET','role')
p('Métropole de Rouen · <link href="mailto:alexis.guinot@onsiea.com">alexis.guinot@onsiea.com</link>','contact')
p('<link href="https://www.alexis-guinot.fr">alexis-guinot.fr</link> · <link href="https://github.com/alescis-wuin">github.com/alescis-wuin</link> · <link href="https://www.linkedin.com/in/alexis-guinot/">linkedin.com/in/alexis-guinot</link>','contact')
items.append(Spacer(1,8));items.append(HRFlowable(width='100%',color=colors.HexColor('#a5b7a8'),thickness=0.7))
p('ALTERNANCE RECHERCHÉE','h2')
p('Un an à partir d’octobre 2026, pour la troisième année du Bachelor Concepteur Développeur d’Applications au CESI. Bac+2 Développeur Informatique obtenu. Présentiel ou hybride dans la Métropole de Rouen ; télétravail possible selon l’entreprise.')
p('EXPÉRIENCE','h2')
p('Familink | Développeur informatique et électronicien · Alternance · 2023-2025','h3')
p('Développement et maintenance autour de cadres photo/vidéo connectés et d’un projet de boîtier TV destiné aux entreprises.')
p('• Intégration des avatars dans les cadres connectés.<br/>• Améliorations et corrections de l’application ; travail sur le boîtier TV.<br/>• Android/Java, Python, Django, ReportLab, Linux, Raspberry Pi et électronique.')
p('Caisse d’Épargne Normandie | Stage de découverte · 2025','h3')
p('Immersion au siège social autour de la gestion de projet, de l’organisation, du management et du fonctionnement d’équipe.')
p('COMPÉTENCES MISES EN PRATIQUE','h2')
p('<b>Java :</b> Spring Boot, JavaFX, Maven. <b>C# / .NET :</b> ASP.NET Core, Blazor, MAUI, Avalonia, EF Core.<br/><b>Web et données :</b> HTML, CSS, JavaScript, REST, PostgreSQL, SQLite, Redis, MinIO.<br/><b>Qualité et livraison :</b> séparation des responsabilités, Git, Docker, GitHub Actions, xUnit, Playwright.')
p('PROJETS PERSONNELS','h2')
p('<b>Streamfolio</b> · Java / Spring Boot, PostgreSQL, Redis, MinIO, FFmpeg<br/>Plateforme vidéo : catalogue, authentification, lecture et pipeline média asynchrone avec jobs persistés, reprise et annulation. Tests et environnement Docker. <link href="https://github.com/alescis-wuin/streamfolio" color="#335d3e">Dépôt public</link>.')
p('<b>Agenda</b> · C# / .NET, Blazor, MAUI, EF Core / SQLite<br/>Prototype d’agenda partageant composants d’interface et logique entre Web et MAUI, avec API REST et tests par couches. <link href="https://github.com/alescis-wuin/agenda" color="#335d3e">Dépôt public</link>.')
p('<b>Calcufolio</b> · C# / .NET, Avalonia / MVVM<br/>Calculatrice desktop avec moteur d’expressions, modèle d’interaction, tests et CI. <link href="https://github.com/alescis-wuin/calcufolio" color="#335d3e">Dépôt public</link>.')
p('FORMATION','h2')
p('<b>2023-2025 · CESI :</b> Bac+2 Développeur Informatique, obtenu en alternance.<br/><b>2025 · CCI :</b> certification entrepreneur ; comptabilité, juridique, communication, marketing.<br/><b>2021 :</b> Bac scientifique.<br/><b>2026-2027 · CESI :</b> troisième année du Bachelor CDA visée, entreprise d’accueil recherchée.')
p('CENTRES D’INTÉRÊT','h2');p('Architecture logicielle, systèmes d’IA, électronique, sciences et botanique.')
SimpleDocTemplate(str(base/'assets/cv/CV_Alexis-GUINOT.pdf'),pagesize=(595.28,841.89),rightMargin=40,leftMargin=40,topMargin=32,bottomMargin=28,title='Alexis Guinot - Concepteur-développeur full-stack',author='Alexis Guinot').build(items)
