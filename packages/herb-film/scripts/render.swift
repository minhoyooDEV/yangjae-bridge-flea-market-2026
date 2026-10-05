import AppKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Deterministic, dependency-free macOS frame renderer. Coordinates are 1280x720.
let W = 1280, H = 720, fps = 30, duration = 30.0
let cream = NSColor(srgbRed: 0.97, green: 0.953, blue: 0.905, alpha: 1)
let ink = NSColor(srgbRed: 0.14, green: 0.23, blue: 0.18, alpha: 1)
let sage = NSColor(srgbRed: 0.40, green: 0.49, blue: 0.33, alpha: 1)
let gold = NSColor(srgbRed: 0.63, green: 0.47, blue: 0.26, alpha: 1)
let blue = NSColor(srgbRed: 0.26, green: 0.61, blue: 0.70, alpha: 1)
func clamp(_ x: Double) -> Double { max(0, min(1, x)) }
func ease(_ x: Double) -> Double { let a = clamp(x); return a*a*(3-2*a) }
func mix(_ a: Double, _ b: Double, _ t: Double) -> Double { a+(b-a)*t }
let space = CGColorSpaceCreateDeviceRGB()
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8,
                    bytesPerRow: W*4, space: space,
                    bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
func color(_ c: NSColor, _ a: Double = 1) -> CGColor { c.withAlphaComponent(a).cgColor }
func rect(_ x: Double,_ y: Double,_ w: Double,_ h: Double,_ c: NSColor,_ r: Double = 0) {
    ctx.setFillColor(c.cgColor)
    ctx.addPath(CGPath(roundedRect: CGRect(x:x,y:y,width:w,height:h), cornerWidth:r, cornerHeight:r, transform:nil)); ctx.fillPath()
}
func ellipse(_ x: Double,_ y: Double,_ w: Double,_ h: Double,_ c: NSColor) {
    ctx.setFillColor(c.cgColor); ctx.fillEllipse(in:CGRect(x:x,y:y,width:w,height:h))
}
func path(_ p: CGPath,_ c: NSColor,_ stroke: NSColor? = nil,_ width: Double = 1) {
    ctx.addPath(p); ctx.setFillColor(c.cgColor)
    if let s = stroke { ctx.setStrokeColor(s.cgColor);ctx.setLineWidth(width);ctx.drawPath(using:.fillStroke) }
    else {ctx.fillPath()}
}
func line(_ x: Double,_ y: Double,_ xx: Double,_ yy: Double,_ c: NSColor,_ w: Double=1) {
    ctx.beginPath();ctx.move(to:CGPoint(x:x,y:y));ctx.addLine(to:CGPoint(x:xx,y:yy));ctx.setStrokeColor(c.cgColor);ctx.setLineWidth(w);ctx.strokePath()
}
func text(_ s: String,_ x: Double,_ y: Double,_ size: Double,_ c: NSColor = ink,_ width: Double = 490,_ serif: Bool = false) {
    let font = NSFont(name: serif ? "Baskerville" : "AppleSDGothicNeo-Medium", size:size) ?? NSFont.systemFont(ofSize:size)
    let para = NSMutableParagraphStyle(); para.lineSpacing=8
    (s as NSString).draw(in:NSRect(x:x,y:y,width:width,height:190),withAttributes:[.font:font,.foregroundColor:c,.paragraphStyle:para])
}
func gradient(_ p: CGPath,_ a: NSColor,_ b: NSColor,_ start: CGPoint,_ end: CGPoint) {
    ctx.saveGState();ctx.addPath(p);ctx.clip()
    let grad=CGGradient(colorsSpace:space,colors:[a.cgColor,b.cgColor] as CFArray,locations:[0,1])!
    ctx.drawLinearGradient(grad,start:start,end:end,options:[]);ctx.restoreGState()
}
func vessel(_ y: Double,_ height: Double,_ top: Double,_ bottom: Double,_ white: Bool,_ alpha: Double=1) {
    ctx.saveGState();ctx.setAlpha(alpha)
    let p=CGMutablePath();p.move(to:CGPoint(x:-top/2,y:y));p.addLine(to:CGPoint(x:top/2,y:y));p.addLine(to:CGPoint(x:bottom/2,y:y+height-8));p.addQuadCurve(to:CGPoint(x:bottom/2-10,y:y+height),control:CGPoint(x:bottom/2,y:y+height));p.addLine(to:CGPoint(x:-bottom/2+10,y:y+height));p.addQuadCurve(to:CGPoint(x:-bottom/2,y:y+height-8),control:CGPoint(x:-bottom/2,y:y+height));p.closeSubpath()
    gradient(p,white ? .white : NSColor(white:0.40,alpha:1),white ? NSColor(white:0.83,alpha:1) : NSColor(white:0.22,alpha:1),CGPoint(x:-top/2,y:y),CGPoint(x:top/2,y:y+height))
    ellipse(-top/2,y-9,top,18,white ? NSColor(white:0.93,alpha:1):NSColor(white:0.22,alpha:1))
    ellipse(-top/2+7,y-5,top-14,10,white ? NSColor(white:0.78,alpha:1):NSColor(white:0.16,alpha:1))
    ctx.restoreGState()
}
func leaf(_ x: Double,_ y: Double,_ angle: Double,_ scale: Double,_ shade: Double) {
    ctx.saveGState();ctx.translateBy(x:x,y:y);ctx.rotate(by:angle);ctx.scaleBy(x:scale,y:scale)
    let p=CGMutablePath();p.move(to:.zero);p.addCurve(to:CGPoint(x:0,y:-66),control1:CGPoint(x:-33,y:-12),control2:CGPoint(x:-28,y:-49));p.addCurve(to:.zero,control1:CGPoint(x:30,y:-55),control2:CGPoint(x:32,y:-15))
    let a=NSColor(srgbRed:0.23+shade*0.09,green:0.40+shade*0.10,blue:0.15,alpha:1)
    gradient(p,a,NSColor(srgbRed:0.40,green:0.57,blue:0.24,alpha:1),CGPoint(x:-24,y:0),CGPoint(x:24,y:-60))
    line(0,-3,0,-59,NSColor(white:0.9,alpha:0.33),1)
    for v in [18.0,30,42] {line(0,-v,-13,-v-8,NSColor(white:0.9,alpha:0.18));line(0,-v,13,-v-8,NSColor(white:0.9,alpha:0.18))}
    ctx.restoreGState()
}
func plant(_ vitality: Double,_ time: Double) {
    let points:[(Double,Double,Double)] = [(-80,-80,-0.95),(-48,-116,-0.5),(-17,-145,-0.2),(20,-128,0.4),(63,-100,0.85),(85,-50,1.1),(-66,-30,-1.2),(-25,-59,-0.55),(27,-63,0.55),(0,-98,0.1),(50,-15,1.0),(-10,-17,-0.3)]
    for (i,(x,y,a)) in points.enumerated() {
        let drop=(1-vitality)*(35+abs(x)*0.25)
        let px=x*(0.92+vitality*0.08), py=y+drop
        let sway=sin(time*1.4+Double(i))*0.018*vitality
        let stem=CGMutablePath();stem.move(to:CGPoint(x:0,y:8));stem.addQuadCurve(to:CGPoint(x:px,y:py),control:CGPoint(x:px*0.3,y:py*0.8))
        ctx.addPath(stem);ctx.setStrokeColor(color(sage));ctx.setLineWidth(3);ctx.strokePath()
        leaf(px,py,a + (a < 0 ? -1 : 1)*(1-vitality)*0.7+sway,0.83+Double(i%3)*0.12,Double(i%3)*0.3)
    }
}
func felt(_ y: Double,_ wet: Double) {
    let p=CGMutablePath();p.move(to:CGPoint(x:-83,y:y+85));p.addLine(to:CGPoint(x:-69,y:y));p.addQuadCurve(to:CGPoint(x:69,y:y),control:CGPoint(x:0,y:y-17));p.addLine(to:CGPoint(x:83,y:y+85));p.addLine(to:CGPoint(x:67,y:y+87));p.addLine(to:CGPoint(x:53,y:y+12));p.addLine(to:CGPoint(x:-53,y:y+12));p.addLine(to:CGPoint(x:-67,y:y+87));p.closeSubpath()
    path(p,NSColor(white:0.87,alpha:1),NSColor(white:0.65,alpha:1),1)
    if wet>0 {ctx.saveGState();ctx.addPath(p);ctx.clip();rect(-90,y+87*(1-wet),180,90*wet,blue.withAlphaComponent(0.7));ctx.restoreGState()}
}
let starts=[0.0,3.5,10.0,15.0,20.0,26.0]
let labels=["A LITTLE THIRSTY", "01 / PUT IT TOGETHER", "02 / JUST ADD WATER", "03 / FOLLOW THE WATER", "04 / A LITTLE TIME", "FRESH HERBS, EVERYDAY"]
let titles=["우리 허브,\n목이 마른 걸까요?", "하나씩,\n가볍게 조립해요.", "물은 아래에.\n허브는 위에.", "작은 패드가\n물을 끌어올려요.", "천천히,\n다시 싱그럽게.", "작은 화분 하나,\n싱그러운 일상."]
let descriptions=["축 처진 잎에서 시작하는\n작은 물주기 이야기.", "펠트 패드를 끼우고\n기존 허브 화분을 그대로 쏙.", "앞쪽 주입구로 물을 채워요.\n분갈이는 필요 없어요.", "물통 → 펠트 패드 → 화분\n수분이 전달되는 길을 따라가요.", "시간이 흐르며\n잎이 조금씩 고개를 들어요.", "자동급수 허브 키퍼 1구\n물 높이를 확인하고 보충해주세요."]
func book(_ time: Double) {
    rect(0,0,1280,720,NSColor(srgbRed:0.18,green:0.27,blue:0.22,alpha:1))
    for i in 0..<120 {let x=Double((i*173)%1280), y=Double((i*113)%720);ellipse(x,y,2,2,NSColor(white:1,alpha:0.025))}
    ctx.saveGState();ctx.setShadow(offset:CGSize(width:0,height:12),blur:24,color:NSColor(white:0,alpha:0.28).cgColor)
    rect(55,52,1170,620,NSColor(srgbRed:0.74,green:0.66,blue:0.49,alpha:1),8);ctx.restoreGState()
    for k in (0..<5).reversed() {rect(62,55+Double(k)*2,1156,603,NSColor(white:0.84+Double(k)*0.02,alpha:1),5)}
    rect(62,54,1156,598,cream,5)
    for i in 0..<1300 {ellipse(Double(70+(i*491)%1135),Double(60+(i*293)%580),1.0,1.0,ink.withAlphaComponent(0.035))}
    let spine=CGPath(rect:CGRect(x:611,y:54,width:58,height:598),transform:nil)
    gradient(spine,cream,ink.withAlphaComponent(0.12),CGPoint(x:611,y:0),CGPoint(x:639,y:0))
    gradient(spine,ink.withAlphaComponent(0.10),cream,CGPoint(x:640,y:0),CGPoint(x:669,y:0))
    text("COLE & MASON",111,94,19,ink,400,true);text("ENGLAND · SINCE 1919",113,124,10,sage)
    text("THE SELF-WATERING STORY",812,95,13,sage)
    line(112,163,566,163,gold.withAlphaComponent(0.5))
    line(112,585,567,585,gold.withAlphaComponent(0.4))
    text("BURWELL   /   SINGLE HERB KEEPER",112,602,11,sage)
    text("물주기의 작은 발견",955,605,13,sage,210)
}
func render(_ t: Double) {
    ctx.saveGState();ctx.translateBy(x:0,y:Double(H));ctx.scaleBy(x:1,y:-1)
    NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=NSGraphicsContext(cgContext:ctx,flipped:true)
    book(t)
    let scene=starts.lastIndex(where:{$0<=t}) ?? 0
    let local=t-starts[scene]
    ctx.saveGState();ctx.setAlpha(scene==0 ? ease(t/0.6):1)
    text(labels[scene],113,205,13,gold)
    text(titles[scene],109,246,43,ink,495)
    text(descriptions[scene],113,392,22,sage,475)
    let notes=["SELF-WATERING · 30초 이야기", "옮겨 심지 않고 화분째 사용해요", "물을 채운 뒤 수위를 확인해주세요", "원리 설명을 위한 단순화 도해", "이해를 돕기 위한 연출 · 회복 시간은 환경에 따라 달라요", "제품 사용법은 동봉된 설명서를 확인해주세요"]
    text(notes[scene],113,528,13,sage,480)
    ctx.restoreGState()
    ctx.saveGState();ctx.translateBy(x:931,y:480)
    ellipse(-153,57,306,27,ink.withAlphaComponent(0.10))
    let assembly=scene==1
    let join=assembly ? ease((local-2.3)/1.6):1
    let potDrop=assembly ? ease((local-4.1)/1.5):1
    let vitality=scene==0 ? 0.05 : scene<4 ? 0.12 : scene==4 ? ease((local-0.8)/4.3):1
    let cutaway=scene==3 ? 1.0:0.0
    if scene==0 {
        vessel(-98,142,175,125,false)
        ellipse(-79,-102,158,15,NSColor(srgbRed:0.23,green:0.20,blue:0.13,alpha:1))
        ctx.saveGState();ctx.translateBy(x:0,y:-99);plant(vitality,t);ctx.restoreGState()
    } else {
        vessel(-29,91,228,185,false,cutaway>0 ? 0.32:1)
        let water=scene==2 ? ease((local-0.6)/3.2):scene>2 ? 1.0:0.0
        if water>0 && (scene==2 || scene==3) {
            ctx.saveGState();ctx.setAlpha(scene==3 ? 0.78:0.35)
            let h=54*water;rect(-88,49-h,176,h,blue,7);ellipse(-88,44-h,176,10,blue);ctx.restoreGState()
        }
        let upperY = mix(-184,-29,join)
        let feltY = assembly ? mix(-269,upperY-8,ease(local/2.2)) : -37.0
        if scene==3 || assembly {felt(feltY,scene==3 ? ease(local/2.2):0)}
        ctx.saveGState();ctx.translateBy(x:0,y:upperY+29)
        vessel(-173,145,278,228,true,cutaway>0 ? 0.20:1)
        if cutaway==0 {
            rect(-45,-102,90,22,NSColor(white:0.52,alpha:1),5)
            text("COLE & MASON",-40,-100,10,.white,85,true)
        }
        ctx.restoreGState()
        if !assembly || local>3.9 {
            ctx.saveGState();ctx.setAlpha(assembly ? ease((local-3.9)/0.5):1)
            ctx.translateBy(x:0,y:mix(-210,-174,potDrop))
            if assembly && potDrop<0.95 {vessel(0,92,174,134,false)}
            ellipse(-115,-6,230,19,NSColor(srgbRed:0.27,green:0.25,blue:0.18,alpha:cutaway>0 ? 0.35:1))
            ctx.saveGState();ctx.scaleBy(x:0.86,y:0.82);plant(vitality,t);ctx.restoreGState();ctx.restoreGState()
        }
        // Front filling lip characteristic of the single Burwell keeper.
        if cutaway==0 {
            let lip=CGMutablePath();lip.move(to:CGPoint(x:-43,y:-27));lip.addLine(to:CGPoint(x:43,y:-27));lip.addCurve(to:CGPoint(x:-43,y:-27),control1:CGPoint(x:49,y:51),control2:CGPoint(x:-49,y:51));lip.closeSubpath()
            gradient(lip,NSColor(white:0.45,alpha:1),NSColor(white:0.29,alpha:1),CGPoint(x:0,y:-25),CGPoint(x:0,y:36))
            ellipse(-40,-32,80,13,NSColor(white:0.14,alpha:1))
            if water>0 {ellipse(-29,-25,58,5,blue.withAlphaComponent(0.7))}
        }
        if scene==2 && local>0.5 && local<4.3 {
            let a=ease((local-0.5)/0.5)*(1-ease((local-3.7)/0.6))
            ctx.saveGState();ctx.setAlpha(a)
            // A small tilted jug gives the water stream a visible source.
            let jug=CGMutablePath();jug.move(to:CGPoint(x:191,y:-217));jug.addLine(to:CGPoint(x:247,y:-201));jug.addLine(to:CGPoint(x:225,y:-137));jug.addQuadCurve(to:CGPoint(x:188,y:-148),control:CGPoint(x:200,y:-127));jug.addLine(to:CGPoint(x:186,y:-142));jug.addLine(to:CGPoint(x:171,y:-151));jug.addLine(to:CGPoint(x:188,y:-164));jug.closeSubpath()
            gradient(jug,NSColor(srgbRed:0.75,green:0.80,blue:0.76,alpha:1),NSColor(srgbRed:0.44,green:0.55,blue:0.48,alpha:1),CGPoint(x:178,y:-200),CGPoint(x:246,y:-140))
            let handle=CGMutablePath();handle.move(to:CGPoint(x:242,y:-195));handle.addCurve(to:CGPoint(x:232,y:-158),control1:CGPoint(x:272,y:-190),control2:CGPoint(x:268,y:-151));ctx.addPath(handle);ctx.setLineWidth(6);ctx.setStrokeColor(color(sage));ctx.strokePath()
            line(191,-217,247,-201,cream,3)
            let stream=CGMutablePath();stream.move(to:CGPoint(x:186,y:-142));stream.addCurve(to:CGPoint(x:0,y:-27),control1:CGPoint(x:119,y:-145),control2:CGPoint(x:4,y:-103));ctx.addPath(stream);ctx.setStrokeColor(color(blue,0.75));ctx.setLineWidth(9);ctx.strokePath()
            for k in 0..<6 {let q=(local*0.7+Double(k)/6).truncatingRemainder(dividingBy:1);ellipse(184*(1-q)-3,-141+114*q*q,6,8,.white.withAlphaComponent(0.7))}
            ctx.restoreGState()
        }
        if scene==3 {
            for side in [-1.0,1.0] {for k in 0..<5 {let q=(local*0.30+Double(k)/5).truncatingRemainder(dividingBy:1);ellipse(side*mix(77,58,q)-4,43-q*93,8,8,blue)}}
            text("펠트 패드",-222,-84,17,ink,130);line(-124,-72,-75,-22,sage,1)
            text("물통",128,22,17,ink,90);line(119,35,91,35,sage,1)
        }
        if scene==4 {
            let sunX=mix(-175,153,ease(local/5.5))
            ellipse(sunX,-280,24,24,gold.withAlphaComponent(0.40))
            text("시간이 흐르면",-50,99,15,sage,190)
        }
    }
    ctx.restoreGState()
    for i in 0..<6 {rect(113+Double(i)*31,563,23,3,i<=scene ? sage:sage.withAlphaComponent(0.18),1)}
    text(String(format:"%02d / 06",scene+1),1130,565,13,sage,90)
    // Curled turning leaf: contiguous curved strips, changing front/back tone and cast shadow.
    if scene>0 && local<0.85 {
        let p=ease(local/0.85), bend=sin(p * .pi)
        let tip=1217-1154*p
        ctx.saveGState();ctx.setShadow(offset:CGSize(width:18*bend,height:3),blur:25*bend,color:ink.withAlphaComponent(0.25*bend).cgColor)
        let curl=CGMutablePath();curl.move(to:CGPoint(x:tip,y:54));curl.addCurve(to:CGPoint(x:tip,y:652),control1:CGPoint(x:tip+100*bend,y:215),control2:CGPoint(x:tip+90*bend,y:491));curl.addLine(to:CGPoint(x:min(1218,tip+185*bend),y:652));curl.addCurve(to:CGPoint(x:min(1218,tip+185*bend),y:54),control1:CGPoint(x:tip+245*bend,y:454),control2:CGPoint(x:tip+246*bend,y:179));curl.closeSubpath()
        gradient(curl,NSColor(srgbRed:0.79,green:0.75,blue:0.65,alpha:1),cream,CGPoint(x:tip,y:0),CGPoint(x:tip+155*bend,y:0));ctx.restoreGState()
    }
    NSGraphicsContext.restoreGraphicsState();ctx.restoreGState()
}
let args=CommandLine.arguments
if args.count>2 {
    render(Double(args[1]) ?? 0)
    let dest=CGImageDestinationCreateWithURL(URL(fileURLWithPath:args[2]) as CFURL,UTType.png.identifier as CFString,1,nil)!
    CGImageDestinationAddImage(dest,ctx.makeImage()!,nil);CGImageDestinationFinalize(dest)
} else {
    for frame in 0..<Int(duration*Double(fps)) {
        autoreleasepool {render(Double(frame)/Double(fps));FileHandle.standardOutput.write(Data(bytes:ctx.data!,count:W*H*4))}
    }
}
