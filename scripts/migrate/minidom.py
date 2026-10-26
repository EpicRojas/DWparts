"""够用的迷你 DOM：只为解析 legacy/index.html 这种规整结构。"""
import re
from html.parser import HTMLParser

VOID = {'img','br','hr','input','meta','link','source'}

class Node:
    __slots__=('tag','attrs','children','parent')
    def __init__(self,tag,attrs=None,parent=None):
        self.tag=tag; self.attrs=dict(attrs or {}); self.children=[]; self.parent=parent
    @property
    def classes(self):
        return (self.attrs.get('class') or '').split()
    def has(self,c): return c in self.classes
    def text(self):
        out=[]
        def rec(n):
            for ch in n.children:
                if isinstance(ch,str): out.append(ch)
                else: rec(ch)
        rec(self); return ''.join(out)
    def norm_text(self):
        return re.sub(r'\s+',' ',self.text()).strip()
    def find_all(self,pred,cache=None):
        res=[]
        def rec(n):
            for ch in n.children:
                if isinstance(ch,Node):
                    if pred(ch): res.append(ch)
                    rec(ch)
        rec(self); return res
    def by_class(self,c): return self.find_all(lambda n:n.has(c))
    def first(self,c):
        r=self.by_class(c); return r[0] if r else None
    def __repr__(self): return f'<{self.tag} {" ".join(self.classes)}>'

class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root=Node('#root'); self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.stack[-1])
        self.stack[-1].children.append(n)
        if tag not in VOID: self.stack.append(n)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:]; return
    def handle_data(self,data):
        if data: self.stack[-1].children.append(data)

def parse(path):
    b=Builder()
    b.feed(open(path,encoding='utf-8').read().replace('\r\n','\n'))
    return b.root
